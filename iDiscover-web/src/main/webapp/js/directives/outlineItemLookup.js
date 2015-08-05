'use strict';

/* Directives */

myApp.directive('outlineItemLookup', ['$filter','$rootScope','$log','DataService','$modal','ThemeService','MetadataService',function($filter,$rootScope,$log,DataService,$modal,ThemeService,MetadataService) {
	return {
		restrict: 'A',
		replace: true,
		terminal:true,
		templateUrl: '../partials/outlineItemLookup.html',
		scope:{
			dialogChanged:'&',
			selectedItem:'=',
            selectedItemChanged:'&',
			studyDefId:'=',
            formDefId:'=',
            selectableDataTypes:'=',
            selectableElementTypes:'='
		},
		link: function(scope, element, attrs) {
			scope.isLoading=false;
			scope.outlineIcon = ThemeService.outlineIcon;

			scope.getCaption=function(){
				if(scope.selectedItem && scope.selectedItem.tarCaption){
					return scope.selectedItem.tarCaption+'  ';
				}else{
					return '';
				}

			}

			scope.selectCaption=function(){
				return scope.selectedItem?'Change Item':'Choose Item';
			}

            scope.changeDialog=function(visible){
                if(scope.dialogChanged){
                    var d=scope.dialogChanged(visible);
                    if(d){
                        d(visible);
                    }
                }
            }

			scope.openOutline=function(){
				scope.changeDialog(true);
				var d = $modal.open({
					keyboard:false,
					templateUrl:'../partials/outlineItemLookupDialog.html',
					controller:'OutlineItemLookupDialog',
					backdropClick: false,
					resolve: {studyDefId:function(){return scope.studyDefId;},
                        formDefId:function(){return scope.formDefId;},
                        selectableDataTypes:function(){return scope.selectableDataTypes;},
                        selectableElementTypes:function(){return scope.selectableElementTypes;}
                    }
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;
				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					if(result){
						scope.selectedItem = {
							tarFormDefElementId:result.tableName=='FORM_DEF_ELEMENT'?result.rowId:0,
							tarStudyDefFormDefId:result.tableName=='STUDY_DEF_FORM_DEF'?result.rowId:0,
                            tarElementId:result.elementId,
							tarCaption:result.caption,
							tarDataTypeId:result.dataTypeId
						};
					}
					scope.changeDialog(false);
				},function(){
                    scope.changeDialog(false);
				});
			};
		}
	};
}]);
