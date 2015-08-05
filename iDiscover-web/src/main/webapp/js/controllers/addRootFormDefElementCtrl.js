myApp.controller('AddRootFormDefElementCtrl', ['$scope','$rootScope', '$modalInstance','formDefDetailSummary','parentElement','DataService','MetadataService','ThemeService','itemToEdit','elementTypeId','$modal',
	function ($scope,$rootScope, $modalInstance,formDefDetailSummary,parentElement,DataService,MetadataService,ThemeService,itemToEdit,elementTypeId,$modal) {

	$scope.searchIcon=ThemeService.searchIcon;
	$scope.hideDialog=false;
    $scope.form={};
	$scope.elementTypeId=itemToEdit?itemToEdit.elementSummary.elementTypeId:elementTypeId;
	$scope.formDefDetailSummary=formDefDetailSummary;
	$scope.maxDisplaySeq=0;
	angular.forEach(formDefDetailSummary.elements,function(value){
		if(value.displaySeq>$scope.maxDisplaySeq){
			$scope.maxDisplaySeq=value.displaySeq;
		}
	});

    $scope.checkboxValueTypes=[
        {id:'TRUE_VALUE',name:'When True'},
        {id:'FALSE_VALUE',name:'When False'}
    ];

    $scope.pushbuttonValueTypes=[
        {id:'USE_INITIALS_WHEN_TRUE',name:'Initials (when true)'},
        {id:'USE_INITIALS_WHEN_FALSE',name:'Initials (when false)'},
        {id:'SIGNATURE',name:'Signature'}
    ];

    $scope.textboxValueTypes=[
        {id:'FORM_VALUE',name:'Form Value'},
        {id:'PRINTED_NAME',name:'Printed Name'},
        {id:'DATE_MODIFIED',name:'Date Modified'}
    ];


	$scope.widgetTypes = [];
	$scope.formDefs = [];
	$scope.processing = false;

    $scope.fieldDataTypes= [1,2,3,4,6];
    $scope.buttonDataTypes= [1,2,3,4,6];

	$scope.stringFormats=[];
	$scope.loadingStringFormats=true;

	$scope.numberFormats=[];
	$scope.loadingNumberFormats=true;

	//	file reference metadata
	$scope.fileRef={};
	$scope.selectedFile={};
	$scope.fileType=null;
	$scope.bytes=null;
	$scope.hasExistingFile=false;
	$scope.metadata={};
	$scope.selectedFileChangedDelegate=function(){
		if($scope.selectedFile.fileRef)
			$scope.element.elementSummary.valueDefSummary.fileValue.fileValue.name= $scope.selectedFile.fileRef.name;

		$scope.processing=true;
		var reader = new FileReader();
		reader.onload = function(e) {
            $scope.element.elementSummary.valueDefSummary.fileValue.fileValue.mimeType = e.target.result.substr(5, e.target.result.indexOf(';')-5) ;
			$scope.bytes = e.target.result.substr(e.target.result.indexOf('base64,')+7);

            // get pdf fields
            DataService.post('data/PDFFile/view',{bytes:$scope.bytes}).then(
                function (newElement) {
                    $scope.processing = false;
                    if(newElement.data.item){
                        var tempItem=newElement.data.item;
                        $scope.element.elementSummary.valueDefSummary.valueDefPDFFields=$scope.element.elementSummary.valueDefSummary.valueDefPDFFields || [];

                        // remove old items
                        var itemsToRemove=[];
                        angular.forEach($scope.element.elementSummary.valueDefSummary.valueDefPDFFields,function(item){
                            var found=false;
                            angular.forEach(tempItem.pdfFields,function(pdfField){
                               if(pdfField.fieldName==item.fieldName){
                                   item.fieldType=pdfField.fieldType;
                                   item.fieldTypeSummary=pdfField.fieldTypeSummary;
                                   found=true;
                               }
                            });
                            if(!found){
                                itemsToRemove.push(item);
                            }
                        });
                        angular.forEach(itemsToRemove,function(item){
                            var index=$scope.element.elementSummary.valueDefSummary.valueDefPDFFields.indexOf(item);
                            $scope.element.elementSummary.valueDefSummary.valueDefPDFFields.splice(index,1);
                        });
                        // add new items
                        var itemsToAdd=[];
                        angular.forEach(tempItem.pdfFields,function(item){
                            var found=false;
                            angular.forEach($scope.element.elementSummary.valueDefSummary.valueDefPDFFields,function(pdfField){
                                if(pdfField.fieldName==item.fieldName){
                                    found=true;
                                }
                            });
                            if(!found){
                                itemsToAdd.push(item);
                            }
                        });
                        angular.forEach(itemsToAdd,function(item){
                            $scope.element.elementSummary.valueDefSummary.valueDefPDFFields.push(item);
                        });

                    }
                    console.log(newElement) ;
                    if (!$scope.$$phase)
                        $scope.$apply();
                },
                function (error) {
                    $scope.alerts.push({msg: error.message || 'Unknown Server Error', type: 'error'});
                    $scope.processing = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                }
            );
		};
		reader.onerror = function(theFile) {
			console.log('Error');
			$scope.processing=false;
		};
		reader.readAsDataURL($scope.selectedFile.fileRef);

		if(!$scope.$$phase){
			$scope.$apply();
		}
	};

    $scope.conditionalVisible=function(){
        return true;
    }

	$scope.calculatedVisible=function(){
		var validWidgetTypes = [1,2,3,4,17,18];
        return $scope.elementTypeId==2 && validWidgetTypes.indexOf($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId)>-1;
	}

	$scope.deIdentifyVisible=function(){
		return $scope.elementTypeId==2 && $scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId!=15;
	}

	$scope.requiredVisible=function(){
		var invalidTypes = [8,15];
		var wtype=$scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId;
		return $scope.elementTypeId==2 && invalidTypes.indexOf(wtype)<0;
	}

	$scope.selectedStringFormat=function(){
		var result=null;
		angular.forEach($scope.stringFormats,function(item){
			if(item.id==$scope.metadata.stringFormatId){
				result=item;
			}
		})
		return result;
	}

	$scope.selectedNumberFormat=function(){
		var result=null;
		angular.forEach($scope.numberFormats,function(item){
			if(item.id==$scope.metadata.numberFormatId){
				result=item;
			}
		})
		return result;
	}

	$scope.updateDeIdentifyStrategy=function(item){
		if(item.deIdentifyStrategyId==2){
			item.deIdentifyStrategyId=1;
		}else{
			item.deIdentifyStrategyId=2;
		}
		$scope.form.$pristine=false;
	}

	DataService.post('data/StringFormat/search',{}).then(function(result){
		$scope.stringFormats =result.data.items;
		$scope.loadingStringFormats=false;
		if(!$scope.$$phase){
			$scope.$apply();
		}

	},function(data, status, headers, config){
		console.log('error %o',arguments);
	});

	DataService.post('data/NumberFormat/search',{}).then(function(result){
		$scope.numberFormats =result.data.items;
		$scope.loadingNumberFormats=false;
		if(!$scope.$$phase){
			$scope.$apply();
		}

	},function(data, status, headers, config){
		console.log('error %o',arguments);
	});

	DataService.post('data/FormDef/search',{formDefTypeId:1}).then(function(result){
		$scope.formDefs =result.data.items;
		if(!$scope.$$phase){
			$scope.$apply();
		}

	},function(data, status, headers, config){
		console.log('error %o',arguments);
	});

	$scope.numberRangeVisible = function(){
		return  $scope.elementTypeId==2 && ($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==4 || $scope.element.elementSummary.valueDefSummary.defaultListWidgetTypeId==4);
	}

	$scope.ratingVisible = function(){
		var result = $scope.elementTypeId==2 && ($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==19);
		if(result){
			if(!$scope.metadata.max){
				$scope.metadata.max=5;
			}
		}
		return result;
	}

    $scope.sliderVisible = function(){
        var result = $scope.elementTypeId==2 && ($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==20);
        if(result){
            if(!$scope.metadata.max){
                $scope.metadata.max=100;
            }
            if(!$scope.metadata.min){
                $scope.metadata.min=0;
            }
        }
        return result;
    }

	$scope.dateRangeVisible = function(){
		return  $scope.elementTypeId==2 && ($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==3 || $scope.element.elementSummary.valueDefSummary.defaultListWidgetTypeId==3);
	}

	$scope.dateTimeRangeVisible = function(){
		return  $scope.elementTypeId==2 && ($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==18 || $scope.element.elementSummary.valueDefSummary.defaultListWidgetTypeId==18);
	}

	$scope.stringValidationVisible = function(){
		return  $scope.elementTypeId==2 && ($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==1 || $scope.element.elementSummary.valueDefSummary.defaultListWidgetTypeId==1 || $scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==12 || $scope.element.elementSummary.valueDefSummary.defaultListWidgetTypeId==12);
	}

	$scope.fileReferenceMetadataVisible = function(){
		return  $scope.elementTypeId==2 && ($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==8 || $scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==11 || $scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==14);
	}

	$scope.consentMetadataVisible = function(){
		return  $scope.elementTypeId==2 && ($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==14);
	}

	$scope.formDefsVisible = function (){
		return  $scope.elementTypeId==2 && ($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==16 || ( $scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==5 && $scope.element.elementSummary.valueDefSummary.defaultListWidgetTypeId==16));
	}

	$scope.widgetTypeVisible = function (){
		return $scope.elementTypeId==2;
	}

	$scope.listWidgetTypeVisible = function (){
		return $scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==5;
	}

	$scope.lookupGroupsVisible = function (){
		return  $scope.elementTypeId==2 && (($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==5 && [9,10,4].indexOf(parseInt($scope.element.elementSummary.valueDefSummary.defaultListWidgetTypeId))>-1)
			|| [9,10,4].indexOf(parseInt($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId))>-1);
	}

	$scope.getFilePath=function(id){
		return DataService.getFilePath(id);
	}
	
	
	$scope.dollarValidation = function() {
		var value = $scope.element.elementSummary.valueDefSummary.costVal;
			if(value.indexOf('$')==-1)
			value = '$' + value;
			if(value.indexOf('.')==-1)
			value = value + '.00' ;
		$scope.element.elementSummary.valueDefSummary.costVal  = value;
		
	}
	
	$scope.numberCheck = function(event){
		var val = $scope.element.elementSummary.valueDefSummary.costVal;
		try{
		var charCode = event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			event.preventDefault();
        }
		return true;
		}
		 catch (err) {
		        alert(err.Description);
		    }
	}
   	
	
	var tempLookupGroup=null;
	var tempListDataType=null;
	var tempListWidgetType=null;
	var tempWidgetType=1;
	var tempDataType = 1;

	if(itemToEdit){
		if(itemToEdit.elementSummary.valueDefSummary.dataTypeId>0){
			tempDataType=itemToEdit.elementSummary.valueDefSummary.dataTypeId;
		}
		if(itemToEdit.elementSummary.valueDefSummary.lookupGroupId>0){
			tempLookupGroup=itemToEdit.elementSummary.valueDefSummary.lookupGroupId;
		}
		if(itemToEdit.elementSummary.valueDefSummary.listDataTypeId>0){
			tempListDataType=itemToEdit.elementSummary.valueDefSummary.listDataTypeId;
		}
		if(itemToEdit.elementSummary.valueDefSummary.defaultListWidgetTypeId>0){
			tempListWidgetType=itemToEdit.elementSummary.valueDefSummary.defaultListWidgetTypeId;
		}
		if(itemToEdit.elementSummary.valueDefSummary.defaultWidgetTypeId>0){
			tempWidgetType=itemToEdit.elementSummary.valueDefSummary.defaultWidgetTypeId;
		}
	}

	var existingElement=itemToEdit?itemToEdit.elementSummary:{};
	var existingValueDef=itemToEdit?itemToEdit.elementSummary.valueDefSummary:{};
    existingValueDef.fileValue=existingValueDef.fileValue || {};
    existingValueDef.fileValue.fileValue=existingValueDef.fileValue.fileValue || {};
    existingValueDef.valueDefPDFFields = existingValueDef.valueDefPDFFields || [];
    angular.forEach(existingValueDef.valueDefPDFFields,function(item){
        item.selectedItem={tarElementId:item.elementId,tarCaption:item.caption};
    });


	$scope.element={
		elementSummary:{
			id:existingElement.id,
			valueDefSummary:{
				id:existingValueDef.id,
				dataTypeId:tempDataType,
				defaultWidgetTypeId:tempWidgetType,
				lookupGroupId:tempLookupGroup,
				lookupGroupSummary:existingValueDef.lookupGroupSummary || {},
				listDataTypeId:tempListDataType,
				defaultListWidgetTypeId:tempListWidgetType,
                listCaption:existingValueDef.listCaption,
				description:existingValueDef.description,
				placeholder:existingValueDef.placeholder,
				name:existingValueDef.name,
				formDefId:existingValueDef.formDefId,
				formDefName:existingValueDef.formDefName,
				metadata:existingValueDef.metadata,
				metadataClasses:existingValueDef.metadataClasses,
				valueDataSourceId:existingValueDef.valueDataSourceId,
                fileValueId:existingValueDef.fileValueId,
                fileValue:existingValueDef.fileValue,
				deIdentifyStrategyId:existingValueDef.deIdentifyStrategyId,
				variableName:existingValueDef.variableName,
                queryId:existingValueDef.queryId,
                valueDefPDFFields:existingValueDef.valueDefPDFFields || [],
                terminologyTags:existingValueDef.terminologyTags?existingValueDef.terminologyTags:[]
			},
			elementTypeId:$scope.elementTypeId,
			parentElementId:parentElement ? parentElement.elementSummary.id: null
		},
		id:itemToEdit?itemToEdit.id:null,
		formDefId:formDefDetailSummary.id,
		insertAfterDisplaySeq:$scope.maxDisplaySeq
	};

	// look for existing fileReference
	if($scope.element.elementSummary.valueDefSummary.metadata && $scope.element.elementSummary.valueDefSummary.metadataClasses){
		$scope.metadata =  MetadataService.getMetadata($scope.element.elementSummary.valueDefSummary);

		if(!$scope.metadata){
			$scope.metadata={};
		}
		if(!$scope.metadata){
			$scope.metadata={};
		}
	}
	$scope.hasExistingFile=$scope.element.elementSummary.valueDefSummary.fileValueId>0;
	$scope.fileType=$scope.hasExistingFile?'existing':'upload';

	$scope.isExistingItem = $scope.element.id > 0;

	$scope.toggleIsRequired=function(){
		$scope.metadata.isRequired=!$scope.metadata.isRequired;
	}

	$scope.toggleValue=function(ob,val){
		ob[val]=!ob[val];
	}

	$scope.invalidDateRange=function(){
		var result=false;
		if($scope.metadata.hasMaxDate==true && $scope.metadata.hasMinDate==true && $scope.metadata.maxDate<=$scope.metadata.minDate){
			result = true;
		}
		return result;
	}


	$scope.validateMax=function(val){
		var result=true;
		if($scope.metadata.hasMax==true && $scope.metadata.hasMin==true && val<=$scope.metadata.min){
			result = false;
		}
		return result;
	}

	$scope.validateMin=function(val){
		var result=true;
		if($scope.metadata.hasMax==true && $scope.metadata.hasMin==true && val>=$scope.metadata.max){
			result = false;
		}
		return result;
	}

	$scope.validateMaxLength=function(val){
		var result=true;
		if($scope.metadata.hasMaxLength==true && $scope.metadata.hasMinLength==true && val<=$scope.metadata.minLength){
			result = false;
		}
		return result;
	}

	$scope.validateMinLength=function(val){
		var result=true;
		if($scope.metadata.hasMaxLength==true && $scope.metadata.hasMinLength==true && val>=$scope.metadata.maxLength){
			result = false;
		}
		return result;
	}

	
	$scope.variableNameVisible=function(){
		return $scope.elementTypeId==2;
	}

	$scope.placeholderVisible=function(){
		var invalidTypes = [8,15,16];
		var wtype=$scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId;
		return $scope.elementTypeId==2 && invalidTypes.indexOf(wtype)<0;
	}


	var tempTitle = itemToEdit? 'Edit ':'Add ';
	console.log('elementType: '+$scope.elementTypeId);
	if($scope.elementTypeId==1){
		tempTitle += 'Section';
	}else if($scope.elementTypeId==2){
		tempTitle += 'Question';
	}else{
		tempTitle += 'Sub Page';
	}

	$scope.title = tempTitle;
	$scope.alerts = [];

	$scope.trimString=function(string,len){
		var result =string;
		if(string && string.length>len){
			result=string.substr(0,len);
		}
		return result;
	}


	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;

			var saveMethod = function(){
				console.log('bout to save %o:',$scope.element);
				// update string metadata
				var selString = $scope.selectedStringFormat();
				if(selString){
					$scope.metadata.stringFormatName=selString.name;
					$scope.metadata.stringFormatErrorMessage=selString.errorMessage;
					$scope.metadata.stringFormat=selString.format;
					$scope.metadata.hasStringFormat=true;
					$scope.metadata.hasMinLength=false;
					$scope.metadata.hasMaxLength=false;
				}else{
					$scope.metadata.hasStringFormat=false;
				}

				var selNum = $scope.selectedNumberFormat();
				if(selNum){
					$scope.metadata.numberFormatName=selNum.name;
					$scope.metadata.numberFormat=selNum.format;
					$scope.metadata.hasNumberFormat=true;
				}

                // update pdffields
                angular.forEach($scope.element.elementSummary.valueDefSummary.valueDefPDFFields,function(item){
                    if(item.selectedItem!=null){
                        item.elementId=item.selectedItem.tarElementId;
                    }
                });

				// check file reference
				$scope.element.elementSummary.valueDefSummary.metadataClasses=JSON.stringify({java:"org.ihc.hwcir.iDiscover.metadata.MetadataBase"});
				$scope.element.elementSummary.valueDefSummary.metadata=JSON.stringify($scope.metadata);
				$scope.element.elementSummary.valueDefSummary.hasEnabledExpression=$scope.metadata.hasEnabledExpression;
				$scope.element.elementSummary.valueDefSummary.isCalculatedValue=$scope.metadata.isCalculatedValue;

				$scope.element.elementSummary.valueDefSummary.name=$scope.trimString($scope.element.elementSummary.valueDefSummary.name,1500);
				$scope.element.elementSummary.valueDefSummary.description=$scope.trimString($scope.element.elementSummary.valueDefSummary.description,1500);

				// find data type
				var wt=$scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId;

				$scope.element.elementSummary.valueDefSummary.dataTypeId=null;
				angular.forEach($scope.widgetTypes,function(wtype){
					if(wtype.id==wt){
						$scope.element.elementSummary.valueDefSummary.dataTypeId=wtype.dataTypeId;
					}
				});

				// find list data type
				if($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==5){
					var listwt=$scope.element.elementSummary.valueDefSummary.defaultListWidgetTypeId;
					angular.forEach($scope.widgetTypes,function(wtype){
						if(wtype.id==listwt){
							$scope.element.elementSummary.valueDefSummary.listDataTypeId=wtype.dataTypeId;
						}
					});
				}

				DataService.post('data/FormDefElement/update',$scope.element).then(
					function (newElement) {
						$scope.processing = false;
						$modalInstance.close(newElement.data.item);
						if (!$scope.$$phase)
							$scope.$apply();
					},
					function (error) {
						$scope.alerts.push({msg: error.message || error.data, type: 'error'});
						$scope.processing = false;
						if (!$scope.$$phase)
							$scope.$apply();
					}
				);
			}

			if($scope.fileReferenceMetadataVisible()){
				// update value
				var valueSummary = {
					dataTypeSummary:{id:7},
                    id:$scope.element.elementSummary.valueDefSummary.fileValueId,
					fileValue:{
                        id:$scope.element.elementSummary.valueDefSummary.fileValueId,
						name:$scope.element.elementSummary.valueDefSummary.fileValue.fileValue.name,
                        mimeType:$scope.element.elementSummary.valueDefSummary.fileValue.fileValue.mimeType,
						hasBytes:$scope.element.elementSummary.valueDefSummary.fileValue.fileValue.hasBytes
					}
				}
                if($scope.element.elementSummary.valueDefSummary.fileValueId==0 && !$scope.bytes){
                    valueSummary.fileValue.hasBytes=false;
                }
				if($scope.bytes){
					valueSummary.fileValue.bytes=$scope.bytes;
                    valueSummary.fileValue.hasBytes=true;
				}else{
					valueSummary.fileValue.filePath=$scope.fileRef.filePath;
				}
				DataService.post('data/Value/update',valueSummary).then(
					function (newElement) {
                        $scope.element.elementSummary.valueDefSummary.fileValueId=newElement.data.item.id;
                        saveMethod();
					},
					function (error) {
						$scope.alerts.push({msg: error.message || 'Unknown Server Error', type: 'error'});
						$scope.processing = false;
						if (!$scope.$$phase)
							$scope.$apply();
					}
				);
			}else{
				saveMethod();
			}
		}
	};

	$scope.showFileReferenceFile = function() {

		var d = $modal.open({
			keyboard:false,
			templateUrl:'../partials/viewFileDialog.html',
			controller:'ViewFileDialogCtrl',
            windowClass: 'modalViewContent',
			resolve: {
                title:function(){return $scope.element.elementSummary.valueDefSummary.fileValue.fileValue.name},
                filePath:function(){return $scope.element.elementSummary.valueDefSummary.fileValueId},
                useSigned:function(){return false},
                useSignature:function(){return false}
            }
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		$scope.hideDialog=true;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			$scope.hideDialog=false;
		});
	};

	$scope.dialogChanged = function(visible) {
		$scope.form.$pristine=false;
		$scope.hideDialog=visible;
		if(!$scope.$$phase){
			$scope.$apply();
		}
	};

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.close = function(result) {
		$modalInstance.close();
	};

	$scope.acceptedMimeTypes = function() {
		if ($scope.element.elementSummary.valueDefSummary.defaultWidgetTypeId==14) {
			$scope.acceptedMimeTypeText = 'View & Sign supports only .pdf format';
			return 'application/pdf';
		} else {
			$scope.acceptedMimeTypeText = 'iPads support the video formats: .m4v, .mp4, .mov and .avi';
			return;
		}
	};

	$scope.openFormTemplateLookup=function(){
		$scope.dialogChanged(true);
		var d = $modal.open({
			keyboard:false,
			templateUrl:'../partials/formTemplateSearch.html',
			controller:'FormTemplateSearchCtrl',
			backdropClick: false
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if(result){
				$scope.element.elementSummary.valueDefSummary.formDefName=result.name;
				$scope.element.elementSummary.valueDefSummary.formDefId=result.id;
				$scope.element.elementSummary.valueDefSummary.resetFormDefinition=true;
			}
			$scope.dialogChanged(false);

		},function(){
			$scope.dialogChanged(false);
		});
	};

	DataService.widgetTypes(function(data) {
		$scope.widgetTypes=data;

		if(!$scope.$$phase){
			$scope.$apply();
		}
	});
}]);