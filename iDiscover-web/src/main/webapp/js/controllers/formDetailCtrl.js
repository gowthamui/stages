myApp.controller('FormDetailCtrl', ['$scope','$rootScope', 'DataService', '$stateParams', '$modal', '$log', '$filter','ThemeService','MetadataService','NotificationService', '$cookieStore','$location', '$state',
	function ($scope,$rootScope, DataService, $stateParams, $modal, $log, $filter,ThemeService,MetadataService,NotificationService,$cookieStore,$location, $state) {
	$scope.formData = null;
	$scope.metadataService=MetadataService;
	$scope.isLoading = true;
	$scope.processing = false;
	$scope.formData = {objectStateTypeSummary: 0};
	$scope.objectStateHistory = [];
	$scope.participantStatusHistoryIcon=ThemeService.participantStatusHistoryIcon;
	$scope.formHistoryIcon=ThemeService.formHistoryIcon;
	$scope.studyDefFormDefId=0;
	$scope.studyEnrollmentId=$stateParams.studyEnrollmentId;
    $scope.studyDefId=$stateParams.studyDefId;
    $scope.studyDef=null;
    $scope.taskIcon=ThemeService.taskIcon;
    $scope.approvedIcon=ThemeService.approvedIcon;
    $scope.deniedIcon=ThemeService.deniedIcon;
    $scope.printIcon=ThemeService.printIcon;
    $scope.studyHistory=[];
    $scope.loadingHistory=false;
    $scope.hasLoadError=false;
    $scope.loadErrorMessage=null;
    $scope.chartOpen=false;
    $scope.chartItem=null;
    $scope.showAuditTrail=true;
    if($cookieStore.get('studyDefId-'+$stateParams.studyDefId+'-auditTrail') ==false){
        $scope.showAuditTrail=false;
    }

    $scope.enrollmentLink=$scope.studyEnrollmentId>0?'Study Enrollment':'Study Forms';
    $scope.enrollmentHref=$scope.studyEnrollmentId>0?'studyEnrollment':'studyForms';


	$scope.currentState = {
        data:{
    	    participantId:$stateParams.participantId,
		    studyDefFormDefId:$stateParams.studyDefFormDefId
        }
	}


    $scope.hasChartReviewFeature=function(){
        var result=false;
        if($scope.studyDef){
            if($scope.studyDef.chartReviewSettings.documents.length>0){
                result=true;
            }
        }

        return result;

    }

	$scope.$on(NotificationService.modifiedElements, function(event, modifiedValues) {
		angular.forEach(modifiedValues,function(item){

			angular.forEach($scope.formData.elements,function(formElement){
				if(formElement.id==item.id){
					// show hide
					formElement.isDisabled=item.isDisabled;
                    if([1,3].indexOf(formElement.elementSummary.elementTypeId)>=0 || $scope.isSubForm(formElement)){
                        // close/open if header
                        if(item.isDisabled){
                            formElement.elementSummary.isOpen = false;
                            $scope.toggleChildren(formElement,true);
                        }else{
                            formElement.elementSummary.isOpen = true;
                            $scope.toggleChildren(formElement,false);
                        }

                    }

				}
			});

		});
	});


    $scope.hideDisabled=function(){
        angular.forEach($scope.formData.elements,function(item){
            if(item.isDisabled){
                item.elementSummary.isOpen = false;
                $scope.toggleChildren(item,true);
            }
        });
    }

    $scope.canAddTask=function(){
        return true;
    }

    $scope.addTask=function(itemToEdit,$event){
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        }
        itemToEdit=itemToEdit?itemToEdit:{};
        itemToEdit.studyFormId=$scope.formData.studyFormId;
        itemToEdit.studyDefId=$scope.studyDefId;
        var d = $modal.open({
            templateUrl:'../partials/editStudyFormTask.html',
            controller:'EditStudyFormTaskCtrl',
            backdropClick: false,
            resolve: {itemToEdit:function(){return angular.copy(itemToEdit);}}
        });
        $rootScope.isNavigating=true;
        $rootScope.currDialog=d;
        d.result.then(function (result) {
            $rootScope.isNavigating=false;
            $rootScope.currDialog=null;
            if(result){
                $scope.formData.tasks=$scope.formData.tasks?$scope.formData.tasks:[];
                if(!itemToEdit.id || itemToEdit.id==0){
                    // new item
                    $scope.formData.tasks.push(result);
                }else{
                    // sync existing item
                    angular.copy(result,itemToEdit);
                }
                if (!$scope.$$phase)
                    $scope.$apply();
            }
        });
    };

    $scope.getTasks=function(list){
        var results= [];
        angular.forEach(list,function(item){
            if($scope.showCompletedTasks==true){
                results.push(item);
            }else{
                if(item.taskStatusId!=3){
                    results.push(item);
                }
            }
        });
        return results;
    };

    $scope.getCompletedTasksIcon=function(){
        return $scope.showCompletedTasks?'fa fa-check-square-o':'fa fa-square-o';
    };

    $scope.showCompletedTasks=false;

    $scope.toggleShowCompletedTasks=function(){
        $scope.showCompletedTasks=!$scope.showCompletedTasks;
    };


    $scope.toggleAuditTrail=function(){
        $scope.showAuditTrail=!$scope.showAuditTrail;
        $cookieStore.put('studyDefId-'+$scope.studyDefId+'-auditTrail',$scope.showAuditTrail);
    };


	$scope.getToggleIcon=function(){
		return $scope.navigatorOpen?'fa fa-check-square-o':'fa fa-square-o';
	};

    $scope.getAuditToggleIcon=function(){
        return $scope.showAuditTrail?'fa fa-check-square-o':'fa fa-square-o';
    };

    $scope.getChartToggleIcon=function(){
        return $scope.chartOpen?'fa fa-check-square-o':'fa fa-square-o';
    };

	$scope.navigatorOpen=false;

	$scope.toggleNavigator=function(){
		$scope.navigatorOpen=!$scope.navigatorOpen;
        if($scope.navigatorOpen){
            $scope.chartOpen=false;
        }

		window.setTimeout(function(){
			$(window).resize();
		},0);
	};

    $scope.toggleChart=function(){
        $scope.chartOpen=!$scope.chartOpen;
        if($scope.chartOpen){
            $scope.navigatorOpen=false;
        }
        window.setTimeout(function(){
            $(window).resize();
        },0);
    };

	$scope.getNavigatorStyle=function(){
		if($scope.navigatorOpen || $scope.chartOpen){
			return {
				visibility:'visible',
				"max-width":"400px"
			}
		}else{
			return {
				visibility:'hidden',
				"max-width":"0px"
			}
		}
	};

	$scope.isHeader=function(element){
		return element.elementTypeId==1;
	};

	$scope.getRequiredIcon=function() {
		return ThemeService.requiredIcon;
	};



    $scope.getRequiresInitialsIcon=function() {
        return ThemeService.requiresInitialsIcon;
    }

	$scope.getCommentIcon=function(element){
		var currValue=element.currentValueSummary || {};
		var comments =currValue.comments||"";
		if(comments.trim().length>0){
			return ThemeService.valueCommentFullIcon;
		}else{
			return ThemeService.valueCommentEmptyIcon;
		}
	}

	$scope.getTruncatedComments=function(comments){
		var result = comments || "";
		var maxLength=100;
		if(result.length>maxLength){
			result = result.substring(0,maxLength)+"...";
		}
		return result;
	}

    $scope.dropComment=function(element,$event){
        var chartReviewComment= $event.originalEvent.dataTransfer.getData("chartreviewdocument");
        $scope.addComment(element,chartReviewComment);
    }

    $scope.dragoverComment=function($event){
        var isChart = $event.originalEvent.dataTransfer.types.indexOf("chartreviewdocument")>=0;
        if(isChart){
            $event.preventDefault();
            return false;
        }
    }


	$scope.addComment=function(element,comment){
		var d = $modal.open({
			templateUrl: '../partials/valueNote.html',
			controller: 'ValueNoteCtrl',
			backdropClick: false,
			resolve: {element: function(){return element}, title:function(){return 'Enter Comments'},comment:function(){return comment},isReadOnly:function(){
				var result =$scope.formData.canEdit;
				if(result==true){
					var invalidStates=[3,4];
					if($scope.formData.objectStateTypeSummary && invalidStates.indexOf($scope.formData.objectStateTypeSummary.id)>-1 && !$scope.isApprover){
						result=false;
					}
				}
				return !result;
			}}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if (result) {
				element.currentValueSummary = element.currentValueSummary || {};
				element.currentValueSummary.comments=result.comments;
				element.currentValueSummary.valueNoteId=result.valueNoteId;
				if(result.clearValue){
                    element.currentValueSummary.initials=null;
                    element.currentValueSummary.hasInitials=false;
					element.currentValueSummary.dateValue=null;
					element.currentValueSummary.boolValue=null;
					element.currentValueSummary.stringValue=null;
					element.currentValueSummary.numberValue=null;
                    if(element.currentValueSummary.signatureValue){
                        element.currentValueSummary.signatureValue={valueId:element.currentValueSummary.signatureValue.valueId};
                    }
					element.currentValueSummary.fileValue=null;
					element.currentValueSummary.listValue=null;
					element.currentValueSummary.valueConsentSummary=null;
					element.currentValueSummary.lookupValueSummary=null;
					element.currentValueSummary.lookupValues=null;
                    element.currentValueSummary.clearValue=true;
				}

				if(element.currentValueSummary.valueNoteId==1){
					element.elementSummary.isOpen=false;
					$scope.toggleChildren(element,true);
				}

				$scope.recordAudit(element,element.isListItem);
			}
		});
	}

	$scope.isSubForm=function(element){
		var result =false;
		if(element.elementSummary){
			if(element.elementSummary.valueDefSummary){
				result = element.elementSummary.valueDefSummary.dataTypeId==10 && element.elementSummary.isOpen;
			}
		}
		return result;
	}

	$scope.isDescription=function(element){
		var result =false;
		if(element.elementSummary){
			if(element.elementSummary.valueDefSummary){
				result = element.elementSummary.valueDefSummary.defaultWidgetTypeId==15;
			}
		}
		return result;
	}

	$scope.getColumnSpan=function(element){
		if(element.elementTypeId==1){
			return 4;
		}else{
			return 1;
		}
	}

	$scope.canApprove = function () {
		var result = false;
		if ($scope.formData.objectStateTypeSummary.id == 5) { // Denied
		} else if ($scope.formData.objectStateTypeSummary.id == 4) { // Approved
		} else if ($scope.formData.objectStateTypeSummary.id == 3 && $scope.formData.isApprover) { // Pending Approval
			result = true;
		} else if ($scope.formData.objectStateTypeSummary.id == 2) { // In Progress
		} else if ($scope.formData.objectStateTypeSummary.id == 1) { // Not Started
		}
		return result;
	}

    $scope.canReset = function () {
        var result = false;
        if ($scope.formData.objectStateTypeSummary.id == 5) { // Denied
            result=true;
        } else if ($scope.formData.objectStateTypeSummary.id == 4) { // Approved
            result=true;
        } else if ($scope.formData.objectStateTypeSummary.id == 3 && $scope.formData.isApprover) { // Pending Approval
            result = true;
        } else if ($scope.formData.objectStateTypeSummary.id == 2) { // In Progress
            result=true;
        } else if ($scope.formData.objectStateTypeSummary.id == 1) { // Not Started
        }
        return result;
    }

	$scope.showParticipantStatusHistory=function(){
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		var d = $modal.open({
			templateUrl:'../partials/objectStateHistory.html',
			controller:'ObjectStateHistoryCtrl',
			backdropClick: false,
			resolve: {title:function(){return 'Participant Status History'},tableName:function(){return 'STUDY_ENROLLMENT'},rowId:function(){return $scope.formData.studyEnrollmentSummary.id}}
		});
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
		});
	}

	$scope.getFolderClass = function (item) {
		return ThemeService.getElementIcon(item);
	}

	$scope.canDeny = function () {
		var result = false;
		var ids = [3];
		return ids.indexOf($scope.formData.objectStateTypeSummary.id) > -1 && $scope.formData.isApprover;
	}

	$scope.canRevokeApproval = function () {
		var result = false;
		var ids = [4];
		return ids.indexOf($scope.formData.objectStateTypeSummary.id) > -1 && $scope.formData.isApprover;
	}

	$scope.canPrint = function () {
		return $scope.formData.formId > -1;
	}

	$scope.openPrint = function () {
		window.open('reports/form.jsp?studyFormId=' + $scope.formData.studyFormId);
	}

	$scope.canSubmit = function () {
		var result = false;
		var ids = [1, 2];
		return ids.indexOf($scope.formData.objectStateTypeSummary.id) > -1 && $scope.formData.canEdit;
	}

	$scope.canReSubmit = function () {
		var result = false;
		var ids = [5];
		return ids.indexOf($scope.formData.objectStateTypeSummary.id) > -1 && $scope.formData.canEdit;
	}

	$scope.approve = function () {
		updateStatusFn(1);
	}

    $scope.reset = function () {
        updateStatusFn(6);
    }

	$scope.deny = function () {
		updateStatusFn(2);
	}

	$scope.revoke = function () {
		updateStatusFn(3);
	}

	$scope.isHidden=function(element){
		return element.hide || element.isDisabled==true;
	}

	$scope.getLevels=function(hierarchy){
		var count = 0;
		var levels = hierarchy.split('.');
		angular.forEach(levels,function(item){
			if(item && item.length>0){
				count++;
			}
		});
		return count;
	}

	$scope.isParentOpen=function(hierarchy,elements){
		var result=true;
		var parts = hierarchy?hierarchy.split('.'):[];
		var currIndex=parts.length-1;
		var tempId;
		var initialFound=false;//ignore initial item
		while(currIndex>=0){
			tempId=parseInt(parts[currIndex]);
			if(tempId>0){
				if(initialFound==true){
					// find in elements
					angular.forEach(elements,function(item){
						if(item.elementSummary){
							if(item.elementSummary.id==tempId){
								if(item.elementSummary.isOpen==false){
									currIndex=-1;
									result=false;
								}
							}
						}
					});
				}
				initialFound=true;
			}
			currIndex--;
		}
		return result;
	}

	$scope.toggleChildren=function(root,showHide){
		var parentHierarchy= (root.hierarchy || '');//+'.'+root.id;
		angular.forEach($scope.formData.elements,function(item){
			var childHierarchy = item.hierarchy || '';
			if(childHierarchy.length>=parentHierarchy.length && item!=root){
				if(childHierarchy.substring(0,parentHierarchy.length)==parentHierarchy){
					if(showHide){
						item.hide=true;
					}else{
						// check if parent is open
						item.hide=!$scope.isParentOpen(item.hierarchy,$scope.formData.elements);

					}
				}
			}
		});
	}

	$scope.isList=function(element){
		return element.elementSummary.valueDefSummary.defaultWidgetTypeId == 5;
	}

	$scope.isComplete=function(subForm){
		var result=false;
		if(subForm){
			if(subForm.objectStateSummary){
				if(subForm.objectStateSummary.objectStateTypeSummary){
					result = subForm.objectStateSummary.objectStateTypeSummary.id==6;
				}
			}
		}
		return result;
	}

	$scope.parseDate=function(dateValue){
		try{
			return new Date(dateValue)
		}catch(x){
			return null;
		}

	}

	$scope.updateList=function(element,successCallback,errorCallback){
		var itemToEdit = {};
		angular.copy(element,itemToEdit);


		DataService.post('data/FormElement/update',itemToEdit).then(
			function (newItem) {
				if(newItem.data.hasError){
					$log.log(error);
				}else{
					if(newItem.data.item.currentValueSummary.dateValue){
						newItem.data.item.currentValueSummary.dateValue=$scope.parseDate(newItem.data.item.currentValueSummary.dateValue);
					}
					element.currentValueSummary=newItem.data.item.currentValueSummary;
					element.previousValueSummary=newItem.data.item.previousValueSummary;
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
	}

	$scope.addListItem=function(element){
		$scope.processing=true;
		var _s=$scope;
		var callback=function(){
			var itemSummary={
				valueListId:element.currentValueSummary.id,
				currentValueSummary:{},
				dataTypeId:element.elementSummary.valueDefSummary.listDataTypeId
			};

			DataService.post('data/ValueListItem/update', itemSummary).then(
				function (newItem) {
					_s.processing=false;
					element.currentValueSummary.id=newItem.data.item.valueListId;
					$scope.addListItems([newItem.data.item],element);
				},
				function (error) {
					$log.log("unknown error: %o",error);
					_s.processing=false;
					if (!_s.$$phase)
						_s.$apply();
				}
			);

		}

		$scope.updateList(element,callback);


	}

	$scope.deleteListItem=function(element){
		$scope.processing=true;

		var index = $scope.formData.elements.indexOf(element);
		var startIndex=index;
		var parentH=element.hierarchy;
		while(index+1<$scope.formData.elements.length){
			var h=$scope.formData.elements[index+1].hierarchy;
			if(h.substr(0,parentH.length)==parentH){
				index++;
			}else{
				break;
			}
		}
		$scope.formData.elements.splice(startIndex, index-startIndex+1);

		DataService.post('data/ValueListItem/delete', element.elementSummary).then(
			function (newItem) {
				$scope.processing=false;

			},
			function (error) {
				$log.log("unknown error: %o",error);
				$scope.processing=false;
				if (!$scope.$$phase)
					$scope.$apply();
			}
		);

	}

	$scope.addListItems=function(listItems,element){
		var newElements = [];

		var listValueDefSummary={
			dataTypeId:element.elementSummary.valueDefSummary.listDataTypeId,
			defaultWidgetTypeId:element.elementSummary.valueDefSummary.defaultListWidgetTypeId ,
			formDefId:element.elementSummary.valueDefSummary.formDefId ,
			listCaption:element.elementSummary.valueDefSummary.listCaption,
			name:element.elementSummary.valueDefSummary.name,
			description:element.elementSummary.valueDefSummary.description,
			lookupGroupId:element.elementSummary.valueDefSummary.lookupGroupId,
			lookupGroupSummary:element.elementSummary.valueDefSummary.lookupGroupSummary
		};

		if(listItems){
			angular.forEach(listItems,function(listItem){
				var result='';
				if(listItem.name){
					result=listItem.name;
				}else if(listValueDefSummary.listCaption){
					result=listValueDefSummary.listCaption;
				}else{
					result=listValueDefSummary.name;
				}

				var newEl ={
					elementSummary:{},
					elementTypeId:2,
					id:listItem.id

				};
				angular.copy(listItem,newEl.elementSummary);
				newEl.id=listItem.id;
				newEl.valueListId=listItem.valueListId;
				newEl.currentValueSummary = listItem.currentValueSummary;
				newEl.isListItem=true;
				newEl.elementSummary.elementTypeId=2;
				newEl.elementSummary.valueDefSummary=listValueDefSummary;
				newEl.caption=result;
				newEl.previousValueSummary=listItem.previousValueSummary;
				newElements.push(newEl);
			});
		}

		var orderedItems = orderItems(newElements);
		var index = $scope.formData.elements.indexOf(element);
		var parentH=element.hierarchy;
		while(index+1<$scope.formData.elements.length){
			var h=$scope.formData.elements[index+1].hierarchy;
			if(h.substr(0,parentH.length)==parentH){
				index++;
			}else{
				break;
			}
		}
		angular.forEach(orderedItems,function(item){
			item.subForm = element;
			item.hierarchy=element.hierarchy+item.hierarchy;
			$scope.formData.elements.splice(index+1, 0, item);
			index++;
		});
        $scope.hideDisabled();
	}

	$scope.canToggle=function(element){
		var result = true;
		if(element.currentValueSummary)
			result = element.currentValueSummary.valueNoteId!=1;
		if(result)
			result =element.elementSummary.valueDefSummary.defaultWidgetTypeId == 16 || element.elementSummary.valueDefSummary.defaultWidgetTypeId == 5 || element.elementSummary.elementTypeId == 3 || element.elementSummary.elementTypeId == 1;
        if(result)
            result=!element.isLoading;
		return result;
	}

    $scope.renameListCaption=function(element,onOff){
        element.isRenamingCaption=onOff;
    }

	$scope.updateListCaption=function(element){
        element.isRenamingCaption=false;
		element.name = element.caption;
		if(element.currentValueSummary){
			if(element.currentValueSummary.dataTypeSummary){
				element.dataTypeId=element.currentValueSummary.dataTypeSummary.id;
			}else if(element.elementSummary.valueDefSummary){
				element.dataTypeId=element.elementSummary.valueDefSummary.dataTypeId;
			}
		}
		DataService.post('data/ValueListItem/update', element).then(
			function (newItem) {
				$scope.processing=false;
			},
			function (error) {
				$log.log("unknown error: %o",error);
				$scope.processing=false;
				if (!$scope.$$phase)
					$scope.$apply();
			}
		);
	}

	$scope.openCloseRow = function(element, openRow,callback){
		if([1,3].indexOf(element.elementSummary.elementTypeId)>=0){
			element.elementSummary.isOpen = openRow;
			$scope.toggleChildren(element,!openRow);
			if(callback){
				callback();
			}
		}
		else if (element.elementSummary.valueDefSummary.defaultWidgetTypeId == 16) {     // subform
			if (openRow) {
				element.elementSummary.isOpen = true;
				if (element.elementSummary.isOpen && !element.isLoaded) {
					element.isLoaded = true;
					element.isLoading = true;

					var formId = 0;
					if (element.currentValueSummary.formId > 0) {
						formId = element.currentValueSummary.formId;
					}

					var subFormRequest ={formId: formId, formDefId: element.elementSummary.valueDefSummary.formDefId, valueSummary: element.currentValueSummary};
					if(!element.isListItem){
						subFormRequest.formElementId=element.id;
					}else{
						subFormRequest.valueListItemId=element.id;
					}
					DataService.post('data/SubFormDetail/view', subFormRequest).then(
						function (newItem) {
							element.isLoading = false;
							var index = $scope.formData.elements.indexOf(element);
							var orderedItems = orderItems(newItem.data.item.elements);
							angular.forEach(orderedItems,function(item){
								item.subForm = element;
								item.hierarchy=element.hierarchy+item.hierarchy;

								$scope.formData.elements.splice(index+1, 0, item);
								index++;
							});
                            $scope.hideDisabled();
							if(callback){
								callback();
							}
						},
						function (error) {
							element.isLoading = false;
							if(callback){
								callback();
							}
						}
					);
				}else{
					element.elementSummary.isOpen = true;
					$scope.toggleChildren(element,false);
					if(callback){
						callback();
					}
				}
			}else{
				element.elementSummary.isOpen = false;
				$scope.toggleChildren(element,true);
				if(callback){
					callback();
				}
			}
		}else if (element.elementSummary.valueDefSummary.defaultWidgetTypeId == 5) {
			if (openRow) {
				element.elementSummary.isOpen = true;
				if (element.elementSummary.isOpen && !element.isLoaded) {
					element.isLoaded = true;
					element.isLoading = true;
					if(!element.currentValueSummary.listValue){
						element.isLoading = false;
					}else{
						DataService.post('data/ValueList/view',element.currentValueSummary.listValue).then(function(newItem){
							element.isLoading=false;
							var listItems = newItem.data.item.listItems;
							angular.forEach(listItems,function(item,index){
								item.displaySeq=index;
							});
							$scope.addListItems(listItems,element);

						},function(data, status, headers, config){
							console.log('error %o',arguments);
						});
					}
					if(callback){
						callback();
					}
				}else{
					element.elementSummary.isOpen = true;
					$scope.toggleChildren(element,false);
				}
				if(callback){
					callback();
				}
			}else{
				element.elementSummary.isOpen = false;
				$scope.toggleChildren(element,true);
				if(callback){
					callback();
				}
			}
		}
	}

	$scope.toggleRow = function (element,callback) {
		var temp = $scope.canToggle(element);
		if(temp)
			$scope.openCloseRow(element,!element.elementSummary.isOpen,callback);
	}

	var updateStatusFn = function (userActionTypeId) {

		var d = $modal.open({
			templateUrl: '../partials/commentsDialog.html',
			controller: 'CommentsDialogCtrl',
			backdropClick: false,
			resolve: {comments: function(){return ''}, title:function(){return 'Enter Comments'},isReadOnly:function(){return false}}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if (result) {
				$scope.processing = true;
				var approval = {
					rowId: $scope.formData.formId,
					tableName: 'FORM',
					comments: result.comments,
					userActionTypeSummary: {id: userActionTypeId}
				};

				DataService.post('data/UserAction/update', approval).then(
					function (newItem) {
						$scope.processing = false;
						$scope.formData.objectStateTypeSummary = newItem.data.item.objectStateTypeSummary;
						if (!$scope.$$phase)
							$scope.$apply();
						$scope.getHistory();
						$rootScope.$broadcast(NotificationService.userActionUpdated, newItem.data.item.objectStateTypeSummary);
					},
					function (error) {
						$log.log("unknown error:" + error);
						$scope.processing = false;
						if (!$scope.$$phase)
							$scope.$apply();
					}
				);
			}
		});
	}

	$scope.submit = function () {
		updateStatusFn(3);
	}

	$scope.reSubmit = function () {
		updateStatusFn(3);
	}

	$scope.refreshCurrentForm=function(callback){
		var params = {
			studyDefFormDefId: $scope.currentState.data.studyDefFormDefId
		};
		if ($scope.currentState.data.participantId > 0) {
			params.participantId = $scope.currentState.data.participantId;
		}
		DataService.post('data/StudyFormDetail/view', params).then(function (result) {
			var summary = result.data;
			$scope.formData = summary.item;
            $scope.getStudyHistory();
			callback(summary.item.elements);

		}, function (data, status, headers, config) {
			console.log('error %o', arguments);
		});
	}

	$scope.$watch('currentState.data',function(newValue,oldValue){

		// don't fire on initial load
        if(newValue && newValue.hasLoadError){
            $scope.hasLoadError=true;
            $scope.loadErrorMessage=newValue.hasLoadError;
        }
		else if(parseInt(newValue.studyDefFormDefId)>0 && oldValue!=newValue){
			if(newValue.hierarchy && newValue.hierarchy.length>0){
				$scope.isLoading = true;
				$scope.refreshCurrentForm(function(elements){
					$scope.formData.elements = orderItems(elements);
                    $scope.hideDisabled();
					$scope.getHistory();
					var subFormRequest ={participantId: $scope.currentState.data.participantId, hierarchy: $scope.currentState.data.hierarchy};
					DataService.post('data/SubFormDetail/view', subFormRequest).then(
						function (newItem) {
							$scope.isLoading = false;
							if(!$scope.formData){
								$scope.formData={};
							}

							var tempParentElement= newItem.data.item.formElementSummary;

							$scope.formData.canEdit=newItem.data.item.canEdit;
							tempParentElement.hierarchy='';
							tempParentElement.isLoaded=true;
							tempParentElement.isLoading=false;
							tempParentElement.elementSummary.isOpen=true;
							var tempItems= orderItems(newItem.data.item.elements);
							angular.forEach(tempItems,function(item){
								item.subForm = tempParentElement;
								item.hierarchy=tempParentElement.hierarchy+item.hierarchy;
							});
							tempItems.unshift(tempParentElement);
							$scope.formData.elements=tempItems;
                            $scope.hideDisabled();
						}
					);
				});
			}else{
				$scope.isLoading = true;
                $scope.hasLoadError=false;
                $scope.loadErrorMessage=null;
				$scope.refreshCurrentForm(function(elements){
					$scope.formData.elements = orderItems(elements);
                    $scope.hideDisabled();
					$scope.getHistory();
					$scope.isLoading = false;

				});
			}
		}else if(newValue && newValue.outline ){

            // show form summary
            $scope.isLoading = true;
            $scope.hasLoadError=false;
            $scope.loadErrorMessage=null;
            $scope.formData=null;
            $scope.formSummaryList=[];

            DataService.post('data/StudyEnrollmentStatusSummary/view', {id:$scope.studyEnrollmentId}).then(function (result) {
                var summary = result.data;
                $scope.isLoading = false;
                var summ=result.data.item;
                $scope.formSummary=summ;
                $scope.formSummary.outline=newValue.outline;

            }, function (data, status, headers, config) {
                console.log('error %o', arguments);
            });

        }

    });

    $scope.getFormSubTitle=function(item){
        var result = "";
        if (item.numberOfQuestions > 0) {
            result = item.numberOfQuestionsAnswered +" of "+item.numberOfQuestions+" answered";
        }

        return result;
    }

    $scope.getFormStatusLabel=function(item){
        var result="";
        if (item.objectStateTypeSummary != null) {
            result=item.objectStateTypeSummary.name;
        }else{
            if (item.numberOfQuestionsAnswered > 0) {
                result = "In Progress";
            }else{
                result = "Not Started";
            }
        }
        return result;
    }

    $scope.getFormStatusIcon=function(item){
        var iconClass="";
        if (item.objectStateTypeSummary != null) {
            if (item.objectStateTypeSummary.id == 4) {
                iconClass = ThemeService.approvedIcon;
            }else if (item.objectStateTypeSummary.id == 5) {
                iconClass = ThemeService.deniedIcon;
            }else if (item.objectStateTypeSummary.id == 7) {
                iconClass = ThemeService.inProgressIcon;
            }else if (item.objectStateTypeSummary.id == 6) {
                iconClass = ThemeService.completeIcon;
            }else if (item.objectStateTypeSummary.id == 1) {
                iconClass = ThemeService.notStartedIcon;
            }else if (item.objectStateTypeSummary.id == 2) {
                iconClass = ThemeService.inProgressIcon;
            }else if (item.objectStateTypeSummary.id == 3) {
                iconClass = ThemeService.pendingApprovalIcon;
            }
        } else {
            if (item.numberOfQuestionsAnswered > 0) {
                iconClass = ThemeService.inProgressIcon;
            } else {
                iconClass = ThemeService.notStartedIcon;
            }
        }
        return iconClass;
    }

    $scope.openForm=function(form,$event){
        $event.preventDefault();
        $event.stopPropagation();

        $scope.currentState.data={
            participantId:$scope.currentState.data.participantId,
            studyDefFormDefId:form.rowId,
            item:form
        };
    }

    $scope.openEnrollmentProperties=function(){
        var enrollmentToEdit= null;
        if($scope.formData){
            enrollmentToEdit=$scope.formData.studyEnrollmentSummary;
        }else{
            enrollmentToEdit=$scope.formSummary.studyEnrollmentSummary;
        }
        var d = $modal.open({
            templateUrl:'../partials/editParticipantEnrollment.html',
            controller:'EditParticipantEnrollmentCtrl',
            backdropClick: false,
            resolve: {itemToEdit:function(){return enrollmentToEdit;}}
        });
        $rootScope.isNavigating=true;
        $rootScope.currDialog=d;
        d.result.then(function (result) {
            $rootScope.isNavigating=false;
            $rootScope.currDialog=null;
            if(result){

                if(enrollmentToEdit!=null){
                    // sync existing participant
                    angular.copy(result.item,enrollmentToEdit);
                }
                if (!$scope.$$phase)
                    $scope.$apply();
            }
        });
    };


	$scope.getIndent = function(element) {
		var levels = 0;
		var cursor = 'text';
		if(element.hierarchy){
			levels = $scope.getLevels(element.hierarchy);
		}
		if ($scope.canToggle(element)) {
			cursor = 'pointer'
		}
		return {
			"margin-left": levels * ThemeService.indentPixels + 'px',
			"cursor": cursor
		}
	};

	$scope.getSignaturePath = function (item) {
		var result = null;
		try {
			result = item.currentValueSummary.signatureValue.valueId;
		} catch (x) {
		}
		return result;
	}

	$scope.getFilePath = function (item) {
		return MetadataService.getMetadata(item.elementSummary.valueDefSummary).fileValueId;
	}

	$scope.getFormattedValue = function (item) {
		var result = '';
		if (item.elementSummary.elementTypeId == 2) { // question
			var wtype = item.elementSummary.valueDefSummary.defaultWidgetTypeId;
			var currValue = item.currentValueSummary || {};
			if (wtype == 1) {      // string
				result = currValue.stringValue;
			} else if (wtype == 2) {      // bool
				result = currValue.boolValue;
			} else if (wtype == 3) {      // date
				result = currValue.dateValue;
			} else if (wtype == 4) {      // number
				result = currValue.numberValue;
			} else if (wtype == 5) {      // list

			} else if (wtype == 6) {      // sig
				var sig = currValue.signatureValue;
				if (sig != null) {
					result = 'Signed ons ' + $filter('date')(currValue.modifiedOn);
				}
			} else if (wtype == 7) {      // file
				var fileValueId = MetadataService.getMetadata(item.elementSummary.valueDefSummary).fileValueId
				if(fileValueId>0){
					result = "View file...";
				}
			} else if (wtype == 8) {      // view-file
				var fileValueId = MetadataService.getMetadata(item.elementSummary.valueDefSummary).fileValueId
				if(fileValueId>0){
					result = "View file...";
				}

			} else if (wtype == 9 || wtype == 10) {      // lookup
				if (currValue.lookupValues) {
					angular.forEach(currValue.lookupValues, function (item) {
						if (result.length > 0) {
							result += ', ';
						}
						result += item.lookupValueName;
					});
				}
			} else if (wtype == 11) {      // view and agree
				var agreed = currValue.boolValue;
				if (agreed != null) {
					if (agreed) {
						result = 'Agreed on ' + $filter('date')(currValue.modifiedOn);
					} else {
						result = 'Disagreed on ' + $filter('date')(currValue.modifiedOn);
					}
				}
			} else if (wtype == 12) {      // multi line string
				result = currValue.stringValue;
			} else if (wtype == 13) {      // custom

			}
		}
		return result;
	};

	$scope.getHistory = function () {
		DataService.post('data/ObjectState/search', {tableName: 'FORM', rowId: $scope.formData.formId}).then(function (result) {
			$scope.objectStateHistory = result.data.items;
		}, function (data, status, headers, config) {
			console.log('error %o', arguments);
		});
	};


    DataService.post('data/StudyDef/view', {id: $scope.studyDefId}).then(function (result) {
        $scope.studyDef = result.data.item;
        $scope.studyDef.chartReviewSettings=$scope.studyDef.chartReviewSettings || {};
        if(angular.isString($scope.studyDef.chartReviewSettings)){
            $scope.studyDef.chartReviewSettings=angular.fromJson($scope.studyDef.chartReviewSettings);
        }
        $scope.studyDef.chartReviewSettings.documents=$scope.studyDef.chartReviewSettings.documents || [];

    }, function (data, status, headers, config) {
        console.log('error %o', arguments);
    });


    $scope.getStudyHistory = function () {
        if($scope.formData && $scope.formData.studyEnrollmentSummary && $scope.formData.studyEnrollmentSummary.participantSummary){
            $scope.loadingHistory=true;
            var p = $scope.formData.studyEnrollmentSummary.participantSummary;
            DataService.post('data/StudyHistory/view', {empi: p.idTag,participantId: p.id}).then(function (result) {
                var items=[];
                angular.forEach(result.data.items,function(item){
                    if(item.studyId!=$scope.studyDefId){
                        items.push(item);
                    }
                });
                $scope.studyHistory = items;
                $scope.loadingHistory=false;
            }, function (data, status, headers, config) {
                console.log('error %o', arguments);
                $scope.loadingHistory=false;
            });
        }
    };

	$scope.goBack = function() {
		window.history.back();
	};
	
	var orderItems = function (items, parentId, parentHierarchy) {
		var kids = [];
		var result = [];
		angular.forEach(items, function (value, key) {
			if ((!parentId && !value.elementSummary.parentElementId) || (value.elementSummary.parentElementId == parentId)) {
				kids.push(value);
			}
		});
		kids.sort(function (a, b) {
			return a.displaySeq - b.displaySeq;
		});
		angular.forEach(kids, function (value, key) {

			// check to see if item is open
			if([1,3].indexOf(value.elementSummary.elementTypeId)>=0){
				value.elementSummary.isOpen=true;
			}
			result.push(value);
			value.hierarchy = parentHierarchy ? parentHierarchy : '';
			value.hierarchy += '.' + value.elementSummary.id;
			var myKids = orderItems(items, value.elementSummary.id, value.hierarchy);
			angular.forEach(myKids, function (kidVal) {
				result.push(kidVal);
			});
		});
		return result;
	};

	$scope.recordAudit=function(selectedFormElement,itemIsListItem){
		var itemToEdit = {};
		angular.copy(selectedFormElement,itemToEdit);

		var updateUrl='data/FormElement/update';
		if(itemIsListItem){
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
				}
                $rootScope.$broadcast(NotificationService.modifiedElements, newItem.data.item.modifiedElements);
			},
			function (error) {
				$log.log(error);
			}
		);
	};

	DataService.post('data/StudyEnrollment/search', {
		studyDefSummary : {
			id : $scope.studyDefId
		},
		studyEnrollmentStatusSummary : {
			objectStateTypeSummary : {
				id : 11
			}
		}
	}).then(function(result) {
		$scope.otherStudyEnrollments = result.data.items;

	}, function(data, status, headers, config) {
		console.error('error %o', arguments);
	});
	
	$scope.openOtherStudyEnrollment = function(studyEnrollment) {
		$cookieStore.put('studyEnrollmentId-' + studyEnrollment.id, $scope.formData.studyDefFormDefId);
		$state.transitionTo('studyEnrollmentDetail', {
			studyDefId : studyEnrollment.studyDefSummary.id,
			studyEnrollmentId : studyEnrollment.id,
			studyDefFormDefId : 0,
			participantId : studyEnrollment.participantSummary.id
		});
	};
}]);