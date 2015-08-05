'use strict';

/* Directives */

myApp.directive('formattedValue', ['$filter','$log','DataService','$document','$modal','$rootScope','UserService','ThemeService','MetadataService','NotificationService','$timeout', function($filter,$log,DataService,$document,$modal,$rootScope,UserService,ThemeService,MetadataService,NotificationService,$timeout) {
	return {
		restrict: 'A',
		replace: true,
		terminal:true,
		templateUrl: '../partials/formattedValue.html',
		scope:{
			valueSummary:'=',
			valueDefSummary:'=',
			previousValueSummary:'=',
			canEdit:'=',
			isApprover:'=',
			formElement:'=',
			isListItem:'=',
			subForm:'=',
			formState:'=',
            showAuditTrail:'='
		},
		link: function(scope, element, attrs) {
			var currDef= scope.valueDefSummary || {};

            scope.sliderTimeout=null;
            scope.selectedLookupItems=null;
			scope.dateWatcherPrevValue=null;
			scope.watchingDate=false;
			scope.dateWatcherInitialized = false;
			scope.processing=false;
			scope.filePath=null;
			scope.hasValue=false;
			scope.popupVisible=false;
			scope.loadingLookupValueItems=false;
			scope.lookupGroup=null;
			if(!scope.valueSummary){
				scope.valueSummary={};
			}

			scope.valueDefSummary=currDef;
			scope.commentIcon = ThemeService.commentIcon;
			scope.widgetIcon = "fa fa-pencil-square-o";

			scope.parseDate=function(dateValue){
				try{
					return new Date(dateValue)
				}catch(x){
					return null;
				}
			};


            scope.showAudit=function(){
                return ((scope.templateType=='form' && scope.valueSummary.valueNoteId==1) || scope.templateType!='form') && scope.showAuditTrail;
            };

			scope.isReadOnly=function(){
				var result = (!scope.canEdit || scope.isComplete() || scope.valueDefSummary.isCalculatedValue==1);
				if(result==false){
					// check form state
					var invalidStates=[3,4];
					if(scope.formState && invalidStates.indexOf(scope.formState.id)>-1 && !scope.isApprover){
						result=true;
					}
				}
				return result;
			};

			scope.$on(NotificationService.modifiedElements, function(event, modifiedValues) {
				angular.forEach(modifiedValues,function(item){
					if(scope.formElement.id==item.id){
                        MetadataService.syncValueSummary(scope,'valueSummary',item.currentValueSummary);
						MetadataService.syncValueSummary(scope,'previousValueSummary',item.previousValueSummary);
						scope.updateFormattedValue();
					}
				});
			});

			scope.ratingMax=function(){
				var maxVal= MetadataService.getMetadata(scope.valueDefSummary).max;
				if(!maxVal){
					maxVal=5;
				}
				return maxVal;
			}

            scope.sliderMin=function(){
                var minValue= MetadataService.getMetadata(scope.valueDefSummary).min;
                if(!minValue){
                    minValue=0;
                }
                return minValue;
            }

            scope.sliderMax=function(){
                var maxVal= MetadataService.getMetadata(scope.valueDefSummary).max;
                if(!maxVal){
                    maxVal=100;
                }
                return maxVal;
            }

			scope.numberEntered=function(){
				if(scope.valueDefSummary.lookupGroupId>0 && !scope.getUnitsCaption(scope.valueSummary.lookupValueSummary) && scope.lookupGroup==null){
					scope.loadingLookupValueItems=true;
					DataService.post('data/LookupGroup/view',{id:scope.valueDefSummary.lookupGroupId}).then(function(result){
						scope.loadingLookupValueItems=false;
						scope.lookupGroup=result.data.item;
						scope.lookupGroup.values=scope.groupLookupItems(result.data.item.values,null);
						if(!scope.valueSummary.lookupValueSummary && scope.lookupGroup.values.length>0){
							// find default
							var defaultLookupValue = null;
							angular.forEach(scope.lookupGroup.values,function(item){
								if(item.isDefault==true){
									defaultLookupValue=item;
								}
							});
							if(!defaultLookupValue){
								defaultLookupValue=scope.lookupGroup.values[0];
							}
							scope.valueSummary.lookupValueSummary=angular.copy(defaultLookupValue);
							scope.updateFormattedValue();
						}

					},function(data, status, headers, config){
						console.log('error %o',arguments);
					});
				}

			}

			scope.getUnitsCaption=function(item){
				var hasOtherValue = false;
				var result;
				if(item && item.lookupValueSummary){
					if(item.otherValue){
						if(item.otherValue.length>0){
							hasOtherValue=true;
						}
					}
					if(hasOtherValue){
						result= item.lookupValueSummary.name+': '+item.otherValue;
					}else{
						result= item.lookupValueSummary.name;
					}
				}
				return result;
			}

            scope.getLookupGroupSummary=function(){
                return scope.valueDefSummary.lookupGroupSummary;
            }

			scope.getExistingItem=function(selectedItem){
				var selectedItems =  scope.valueSummary.lookupValues || [];
				var oldItem=null;
				angular.forEach(selectedItems,function(existingItem){
					if(selectedItem.id == existingItem.lookupValueId){
						oldItem=existingItem;
					}
				});
				return oldItem;
			}

			scope.createLookupValue=function(item){
				var result = {};
				result.lookupValueId=item.id;
				result.lookupValueName=item.name;
				result.otherValue=item.otherValue;
				result.id=item.id;
				result.name=item.name;
				return result;
			}

			scope.editMultiLineString = function() {
				var d = $modal.open({
					templateUrl:'../partials/multiLineString.html',
					controller:'MultiLineStringDialogCtrl',
					backdropClick: false,
					resolve: {title:function(){return scope.valueDefSummary.name},caption:function(){return scope.valueDefSummary.name},value:function(){ return scope.valueSummary.stringValue}}
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;
				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					scope.valueSummary.stringValue=result;
					scope.updateFormattedValue();
					scope.recordAudit(scope.formElement);
				});
			};

			scope.isOpen = function(){
				return scope.formElement.elementSummary.isOpen && scope.formElement.isLoaded==true && scope.formElement.isLoading==false;
			}

            scope.lookupSelectionChanged=function(returnedItems){
                scope.valueSummary.lookupValues=scope.valueSummary.lookupValues || [];
                // remove existing
                var itemsToRemove=[];
                angular.forEach( scope.valueSummary.lookupValues,function(existingItem){
                    var found=true;
                    angular.forEach(returnedItems,function(returnedItem){
                        if(returnedItem.id == existingItem.lookupValueId && returnedItem.selected){
                            found=false;
                        }
                    });
                    if(found){
                        itemsToRemove.push(existingItem);
                    }
                });
                angular.forEach(itemsToRemove,function(itemToRemove){
                    var index =   scope.valueSummary.lookupValues.indexOf(itemToRemove);
                    scope.valueSummary.lookupValues.splice(index,1);
                });

                // add new items
                angular.forEach(returnedItems,function(returnedItem){
                    if(returnedItem.selected){
                        var existingItem = scope.getExistingItem(returnedItem);
                        if(!existingItem){
                            existingItem=scope.createLookupValue(returnedItem);
                            scope.valueSummary.lookupValues.push(existingItem);
                        }
                        existingItem.otherValue=returnedItem.otherValue;
                    }
                });

                scope.recordAudit(scope.formElement);
                scope.updateFormattedValue();
            }


            scope.unitsLoaded=function(newGroup){
                scope.lookupGroup=newGroup;
            }

            scope.unitsSelected=function(returnedItems){
                var selectedUnits;
                angular.forEach(returnedItems,function(item){
                    if(item.selected){
                        selectedUnits=item;
                    }
                });

                scope.valueSummary.otherValue=selectedUnits?selectedUnits.otherValue:null;
                scope.valueSummary.lookupValueSummary=selectedUnits?angular.copy(selectedUnits):null;

                // check if number is entered
                if(angular.isNumber(scope.valueSummary.numberValue)){
                    scope.recordAudit(scope.formElement);
                }
                scope.updateFormattedValue();
            }

            scope.getSelectedLookupItems=function(){
                if(currDef.defaultWidgetTypeId!=4){
                    var currItems = scope.valueSummary.lookupValues?scope.valueSummary.lookupValues:[];
                    var tempItems = [];
                    angular.forEach(currItems,function(tempItem){
                        tempItems.push({
                            id:tempItem.lookupValueId,
                            otherValue:tempItem.otherValue,
                            lookupValueName:tempItem.lookupValueName}
                        );
                    });
                    return tempItems;
                }else{
                    if(scope.valueSummary.lookupValueSummary){
                        return [{
                            id:scope.valueSummary.lookupValueSummary.id,
                            otherValue:scope.valueSummary.otherValue,
                            lookupValueName:scope.valueSummary.lookupValueSummary.name}
                        ];
                    }else{
                        return [];
                    }
                }
            }

			scope.ratingChanged=function(item){
				scope.recordAudit(scope.formElement);
				scope.updateFormattedValue();
			}

			scope.groupLookupItems = function(items,parentId){
				var results=[];
				angular.forEach(items,function(item){
					if(item.parentId==parentId){
						if(scope.valueSummary.lookupValueSummary){
							if(scope.valueSummary.lookupValueSummary.id==item.id){
								item.otherValue=scope.valueSummary.lookupValueSummary.otherValue;
							}
						}
						results.push(item);
					}

				});
				angular.forEach(results,function(item){
					item.values=scope.groupLookupItems(items,item.id);
				});
				return results;
			}

			scope.recordAudit=function(selectedFormElement,successCallback,errorCallback){
				var itemToEdit = {};

				angular.copy(selectedFormElement,itemToEdit);
				if(selectedFormElement.currentValueSummary){
					selectedFormElement.currentValueSummary.modifiedOn=new Date();
					selectedFormElement.currentValueSummary.modifiedBy=UserService.userId;
				}


				var updateUrl='data/FormElement/update';
				if(scope.isListItem){
					updateUrl='data/ValueListItem/update';
					if(itemToEdit.currentValueSummary){
						if(itemToEdit.currentValueSummary.dataTypeSummary){
							itemToEdit.dataTypeId=itemToEdit.currentValueSummary.dataTypeSummary.id;
						}else if(itemToEdit.elementSummary.valueDefSummary){
							itemToEdit.dataTypeId=itemToEdit.elementSummary.valueDefSummary.dataTypeId;
						}
					}
				}

				DataService.post(updateUrl,itemToEdit).then(
					function (newItem) {
						if(newItem.data.hasError){
							$log.log(error);
						}else{
							if(newItem.data.item.currentValueSummary.dateValue){
								newItem.data.item.currentValueSummary.dateValue=scope.parseDate(newItem.data.item.currentValueSummary.dateValue);
								scope.dateWatcherPrevValue=newItem.data.item.currentValueSummary.dateValue;
							}
							MetadataService.syncValueSummary(scope,'valueSummary',newItem.data.item.currentValueSummary);

							scope.previousValueSummary=newItem.data.item.previousValueSummary;


							// update modified values
							$rootScope.$broadcast(NotificationService.modifiedElements, newItem.data.item.modifiedElements);
						}
						if(successCallback){
							successCallback();
						}
					},
					function (error) {
						$log.log(error);
						if(errorCallback){
							errorCallback();
						}
					}
				);
			};

			scope.stringValueChanged=function(){
				scope.recordAudit(scope.formElement);
				scope.updateFormattedValue();
			};

            scope.needsInitials=function(){
                return MetadataService.getMetadata(scope.valueDefSummary).requiresUserInitials==true;
            };

			scope.boolValueChanged=function(){
				scope.recordAudit(scope.formElement);
				scope.updateFormattedValue();
			};

            scope.yesNoValueChanged=function(selValue){
                scope.valueSummary.boolValue=selValue;
                scope.recordAudit(scope.formElement);
                scope.updateFormattedValue();
            };

			scope.numberValueChanged = function() {
				if(scope.valueSummary.numberValue == null)
					scope.valueSummary.numberValue = 0;

                var tmp=parseFloat(scope.valueSummary.numberValue)
				if(angular.isNumber(tmp)){
                    scope.valueSummary.numberValue=tmp;
					scope.recordAudit(scope.formElement);
                }
				scope.updateFormattedValue();
			};

            scope.sliderValueChanged = function() {
                $timeout.cancel(scope.sliderTimeout);

                scope.sliderTimeout=$timeout(function(){
                    $log.log('slider timeout')
                    scope.numberValueChanged();
                },300);
            };

			scope.showViewAndAgree=function($event){
				if ($event) {
					$event.preventDefault();
					$event.stopPropagation();
				}

				var s = scope;
				var d = $modal.open({
					templateUrl:'../partials/viewAndAgreeDialog.html',
					controller:'ViewAndAgreeDialogCtrl',
	                windowClass: 'modalViewContent',
					backdropClick: false,
					resolve: {valueSummary:function(){return scope.valueSummary},valueDefSummary:function(){return scope.valueDefSummary},canEdit:function(){return scope.canEdit}}
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;

				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					if(result){
						s.valueSummary.boolValue=result.result;
                        s.valueSummary.modifiedOn=new Date();
						s.updateFormattedValue();
						s.recordAudit(scope.formElement);

					}
				});

			};

			scope.showViewAndSign=function($event){
				if ($event) {
					$event.preventDefault();
					$event.stopPropagation();
				}

				var s = scope;
				var d = $modal.open({
					templateUrl:'../partials/viewAndSignDialog.html',
					controller:'ViewAndSignDialogCtrl',
					windowClass: 'modalViewContent',
					backdropClick: false,
					resolve: {formElement:function(){return scope.formElement},valueSummary:function(){return scope.valueSummary},valueDefSummary:function(){return scope.valueDefSummary},canEdit:function(){return scope.canEdit}}
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;

				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					if(result){
						if(!s.valueSummary.valueConsentSummary){
							s.valueSummary.valueConsentSummary={};
						}
						s.valueSummary.valueConsentSummary.complete=result.result;
						s.updateFormattedValue();
						s.recordAudit(scope.formElement);
					}
				});

			};

			scope.fileViewed=function($event){
				scope.showViewFile($event);

				scope.valueSummary.dateValue=new Date();
				scope.recordAudit(scope.formElement);
				scope.updateFormattedValue();

			};

			scope.showViewFile=function($event){

				if ($event) {
					$event.preventDefault();
					$event.stopPropagation();
				}

				var tempPath = scope.valueDefSummary.fileValueId;
				if(!tempPath){
					tempPath=scope.valueSummary.id;
				}
				var s = scope;
				var d = $modal.open({
					templateUrl:'../partials/viewFileDialog.html',
					controller:'ViewFileDialogCtrl',
	                windowClass: 'modalViewContent',
					backdropClick: false,
					resolve: {
                        title:function(){return scope.valueDefSummary.name},
                        filePath:function(){return tempPath},
                        useSigned:function(){return false},
                        useSignature:function(){return false}
                    }
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;

				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
				});

			};

			scope.editFile=function($event){
				if ($event) {
					$event.preventDefault();
					$event.stopPropagation();
				}

				var s = scope;
				var d = $modal.open({
					templateUrl:'../partials/editFileDialog.html',
					controller:'EditFileDialogCtrl',
					backdropClick: false,
					resolve: {valueSummary:function(){return scope.valueSummary},valueDefSummary:function(){return scope.valueDefSummary}}
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;
				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					if(result){
						if(!s.valueSummary.fileValue){
							s.valueSummary.fileValue ={};
						}
						if(result.useExisting){
							scope.valueSummary.fileValue.name=result.name;
						}else{
							scope.valueSummary.fileValue.name=result.name;
							scope.valueSummary.fileValue.hasBytes=result.hasBytes;
							scope.valueSummary.fileValue.mimeType=result.mimeType;
							if(result.hasBytes){
								scope.valueSummary.fileValue.bytes=result.bytes;
								scope.valueSummary.fileValue.filePath=null;
								scope.valueSummary.fileValue.fileSize=result.bytes.length * 0.75;
							}else{
								scope.valueSummary.fileValue.filePath=result.filePath;
								scope.valueSummary.fileValue.bytes=null;
							}
						}
						scope.recordAudit(scope.formElement);
						scope.updateFormattedValue();
					}
				});
			};

			scope.hasFormApprovalComments=function(){
				var hasComments=false;
				if(scope.formElement){
					if(scope.formElement.objectStateSummary){
						if(scope.formElement.objectStateSummary.comments){
							hasComments=scope.formElement.objectStateSummary.comments.length>0;
						}
					}
				}
				return hasComments;
			};

			scope.canMarkFormComplete=function(){
				var result=false;
				if(!scope.isListItem){
					result=true;
					if(scope.formElement){
						if(scope.formElement.objectStateSummary){
							if(scope.formElement.objectStateSummary.objectStateTypeSummary){
								result = scope.formElement.objectStateSummary.objectStateTypeSummary.id!=6;
							}
						}
					}
				}
				return result;
			};

			scope.updateFormStatus=function(objectStateTypeId){
				var _scope=scope;
				var d = $modal.open({
					templateUrl: '../partials/commentsDialog.html',
					controller: 'CommentsDialogCtrl',
					backdropClick: false,
					resolve: {comments: function(){return ''}, title: function(){ return 'Enter Comments'},isReadOnly:function(){return false}}
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;
				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					if (result) {
						var approval = {
							rowId: _scope.formElement.id,
							tableName: 'FORM_ELEMENT',
							comments: result.comments,
							userActionTypeSummary: {id: objectStateTypeId}
						};

						DataService.post('data/UserAction/update', approval).then(
							function (newItem) {
								if(!_scope.formElement.objectStateSummary){
									_scope.formElement.objectStateSummary={};
								}
								_scope.formElement.objectStateSummary.comments=result.comments;
								_scope.formElement.objectStateSummary.objectStateTypeSummary = newItem.data.item.objectStateTypeSummary;
								_scope.updateFormattedValue();
								$rootScope.$broadcast(NotificationService.userActionUpdated, newItem.data.item.objectStateTypeSummary);

							},
							function (error) {
								$log.log("unknown error:" + error);
								if (!_scope.$$phase)
									_scope.$apply();
							}
						);
					}
				});
			}

			scope.isComplete=function(){
				var result=false;
				if(scope.subForm){
					if(scope.subForm.objectStateSummary){
						if(scope.subForm.objectStateSummary.objectStateTypeSummary){
							result = scope.subForm.objectStateSummary.objectStateTypeSummary.id==6;
						}
					}
				}
				return result;
			}

            scope.initialsModified=function(bytes){
                scope.valueSummary.initials=bytes;
                scope.valueSummary.updateInitials=true;
                scope.valueSummary.hasInitials=true;

                scope.recordAudit(scope.formElement);
            }

			scope.canMarkFormIncomplete=function(){
				var result=false;
				if(!scope.isListItem){
					if(scope.formElement.objectStateSummary){
						if(scope.formElement.objectStateSummary.objectStateTypeSummary){
							result = scope.formElement.objectStateSummary.objectStateTypeSummary.id==6;
						}
					}
				}
				return result;
			};

			scope.showFormApprovalComments=function(){
				if(scope.hasFormApprovalComments()){
					var d = $modal.open({
						templateUrl:'../partials/showCommentsDialog.html',
						controller:'ShowCommentsDialogCtrl',
						backdropClick: false,
						resolve: {comments:function(){return scope.formElement.objectStateSummary.comments},title:function(){return 'Comments'}}
					});
					$rootScope.isNavigating=true;
					$rootScope.currDialog=d;
					d.result.then(function (result) {
						$rootScope.isNavigating=false;
						$rootScope.currDialog=null;
					});
				}
			};

			scope.editSignature=function(){
				scope.valueSummary.signatureValue= scope.valueSummary.signatureValue || {};
				var sigValue = scope.valueSummary.signatureValue;
				var d = $modal.open({
					templateUrl:'../partials/editSignatureDialog.html',
					controller:'EditSignatureDialogCtrl',
					backdropClick: false,
					resolve: {comments:function(){return ''},
                        title:function(){return scope.valueDefSummary.name},
                        description:function(){return scope.valueDefSummary.description},
                        printedName:function(){return sigValue.printedName},
                        signatureValueId:function(){return sigValue.valueId}}
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;
				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					if(result){
						scope.signaturePath='data:image/png;base64,'+result.bytes;
						sigValue.printedName=result.printedName;
						sigValue.mimeType=result.mimeType;
						sigValue.bytes=result.bytes;
                        scope.valueSummary.clearValue=false;
						scope.valueSummary.modifiedOn=new Date();
						scope.updateFormattedValue();
						scope.recordAudit(scope.formElement);

					}
				});
			};

            scope.getSignaturePath=function(){
                var result = 'ws/clientData/image/ValueSignature/-1';
                var currValue = MetadataService.currentValue(scope.valueSummary,currDef);
                if(currValue!=null){
                    if(scope.valueSummary.clearValue!=true){
                        try{
                            if(!scope.signaturePath){
                                result = 'ws/clientData/image/ValueSignature/'+currValue.value.valueId;
                            }else{
                                result = scope.signaturePath;
                            }
                        }catch(x){}
                    }
                }
                return result;

            }


			scope.watchDate=function(){
				if(!scope.watchingDate){
					scope.watchingDate=true;
					scope.$watch('valueSummary.dateValue',function(){
						if(scope.dateWatcherInitialized){
							var dateChanged=true;
							try{
								dateChanged=!(scope.dateWatcherPrevValue.getTime()==scope.valueSummary.dateValue.getTime());
							}catch(x){}
							if(dateChanged){

								scope.recordAudit(scope.formElement);
								scope.updateFormattedValue();
							}
						}
						scope.dateWatcherPrevValue=scope.valueSummary.dateValue;
						scope.dateWatcherInitialized=true;
					});
				}
			}

			scope.updateFormattedValue=function(){
				var currValue = MetadataService.currentValue(scope.valueSummary,currDef);
				scope.formattedValue=currValue.formattedValue;
				scope.hasValue=currValue.hasValue;
				if(scope.valueSummary.valueNoteId==1){
					scope.hasValue=true;
				}
				if(scope.previousValueSummary && scope.previousValueSummary.id>0){
					scope.hasValue=true;
				}
				var wtype=currDef.defaultWidgetTypeId;
				scope.widgetIcon=ThemeService.getWidgetIcon(wtype);
				scope.filePath=MetadataService.getMetadata(currDef).fileValueId;
				scope.templateType= 'other';
				if(wtype==1){      // string
					scope.templateType = 'string';
				}else if(wtype==12){      // multiLinestring
					scope.templateType = 'multiLineString';
				}else if(wtype==2){      // yes or no
					scope.templateType = 'yesOrNo';
				}else if(wtype==3){      // date
					scope.templateType = 'date';
					scope.watchDate();
				}else if(wtype==4){      // number
					scope.templateType = 'number';
				}else if(wtype==5){      // list
					scope.templateType = 'list' ;
				}else if(wtype==6){      // sig
					scope.templateType = 'sig' ;
				}else if(wtype==7){      // file
					scope.templateType='file';
				}else if(wtype==8){      // view-file
					scope.templateType='viewFile';
				}else if(wtype==9 || wtype==10){      // lookup
					scope.templateType = 'lookup';
					scope.canSelectMultipleLookupItems = wtype==10;
				}else if(wtype==11){      // view and agree
					scope.templateType='viewAndAgree';
				}else if(wtype==14){      // view and sign
					scope.templateType='viewAndSign';
				}else if(wtype==16){      // subform
					scope.templateType = 'form';
					scope.formattedValue = '';
					if(scope.formElement){
						if(scope.formElement.objectStateSummary){
							if(scope.formElement.objectStateSummary.objectStateTypeSummary){
								scope.formattedValue = scope.formElement.objectStateSummary.objectStateTypeSummary.name;
								scope.hasValue=true;
							}

						}
					}
				}else if(wtype==17){      // checkbox
					scope.templateType = 'bool';
				}else if(wtype==18){      // datetime
					scope.templateType = 'dateTime';
					scope.watchDate();
				}else if(wtype==19){      // rating
					scope.templateType = 'rating';
				}else if(wtype==20){      // slider
                    scope.templateType = 'slider';
                }
                scope.selectedLookupItems=scope.getSelectedLookupItems();
			}

			scope.updateFormattedValue();

			// set initial value
			if(scope.valueSummary.dateValue){
				scope.valueSummary.dateValue=scope.parseDate(scope.valueSummary.dateValue);
			}


            scope.$watch('valueSummary.stringValue',function(newValue,oldValue){
                scope.updateFormattedValue();
            });
		}
	};
}]);
