'use strict';

/* Directives */

myApp.directive('queryLookup', ['$filter','$rootScope','$log','DataService','$modal','ThemeService','MetadataService',function($filter,$rootScope,$log,DataService,$modal,ThemeService,MetadataService) {
    return {
        restrict: 'A',
        replace: true,
        terminal:true,
        templateUrl: '../partials/queryLookup.html',
        scope:{
            dialogChanged:'&',
            selectedItemChanged:'&',
            queryId:'=',
            selectableTypes:'=',
            selectedItem:'='
        },
        link: function(scope, element, attrs) {
            scope.isLoading=false;
            scope.outlineIcon = ThemeService.outlineIcon;

            scope.getCaption=function(){
                if(scope.selectedItem && scope.selectedItem.name){
                    return scope.selectedItem.name+'  ';
                }else{
                    return '';
                }

            }

            scope.selectCaption=function(){
                return scope.selectedItem && scope.selectedItem.id>0?'Change Source':'Choose Source';
            }

            scope.changeDialog=function(visible){
                if(scope.dialogChanged){
                    var d=scope.dialogChanged(visible);
                    if(d){
                        d(visible);
                    }
                }
            }

            scope.clearValue=function(visible){
                scope.selectedItem = null;
                scope.queryId=null;
                scope.changeDialog(false);
            }

            scope.openBrowser=function(){
                scope.changeDialog(true);
                var d = $modal.open({
                    keyboard:false,
                    templateUrl:'../partials/queryLibrarySearch.html',
                    controller:'QueryLibrarySearchCtrl',
                    windowClass: 'modalViewContent',
                    backdropClick: false,
                    resolve: {queryId:function(){return scope.queryId;},
                        selectableTypes:function(){return scope.selectableTypes;}
                    }
                });
                $rootScope.isNavigating=true;
                $rootScope.currDialog=d;
                d.result.then(function (result) {
                    $rootScope.isNavigating=false;
                    $rootScope.currDialog=null;
                    if(result){
                        scope.selectedItem = {
                            id:result.id,
                            name:result.name
                        };
                        scope.queryId=result.id;
                    }

                    scope.changeDialog(false);
                },function(){
                    scope.changeDialog(false);
                });
            };

            scope.$watch('queryId',function(newValue,oldValue){
                if((newValue!=oldValue && newValue!=null) || (newValue!=null && (scope.query==null || !scope.query.name))){
                    scope.isLoading=true;
                    DataService.post('data/Query/view',{id:scope.queryId}).success(function(result){
                        scope.selectedItem=result.item;
                        scope.isLoading=false;

                    }).error(function(item){
                        scope.isLoading=false;
                    });
                }
            });
        }
    };
}]);
