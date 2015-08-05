'use strict';

/* Directives */

myApp.directive('autoPopulateCtrl', ['$filter','$rootScope','$log','DataService','$modal','ThemeService','MetadataService','$q','NotificationService', 'ConfigService', function($filter,$rootScope,$log,DataService,$modal,ThemeService,MetadataService,$q,NotificationService,ConfigService) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/autoPopulateCtrl.html',
            scope:{
                element:'=',
                studyFormId:'='
            },
            controller: function ($scope) {
                $scope.isLoading=false;
                $scope.metadataService=MetadataService;
                $scope.getAutomatedQueryIcon=function() {
                    if($scope.isLoading){
                        return ThemeService.automatedQueryWorkingIcon;
                    }else{
                        return ThemeService.automatedQueryIcon;
                    }
                };

                $scope.openDialog=function(results){
                    var d = $modal.open({
                        templateUrl:'../partials/autoPopulateResultsDialog.html',
                        controller:'AutoPopulateResultsDialogCtrl',
                        backdropClick: false,
                        windowClass: 'modalViewContent',
                        resolve: {results:function(){return results;}}
                    });
                    $rootScope.isNavigating=true;
                    $rootScope.currDialog=d;
                    d.result.then(function (result) {
                        $rootScope.isNavigating=false;
                        $rootScope.currDialog=null;

                        if(result && result.item){
                            $scope.isLoading=true;
                            DataService.post('data/AutomatedQuery/update',{
                                formElementId:$scope.element.id,
                                updateValue:true,
                                scalarResult:result.item,
                                studyFormId:$scope.studyFormId
                            }).then(function(result){
                                var returnedItem=result.data.item;
                                $rootScope.$broadcast(NotificationService.modifiedElements, returnedItem.modifiedElements);
                                $scope.isLoading=false;
                            });
                        }
                    });
                };

                $scope.$on(NotificationService.autoPopulateAll, function(event, value) {
                    if(MetadataService.hasScalarAutomatedQuery($scope.element.elementSummary.valueDefSummary)){
                        $scope.getValue();
                    }
                });

                $scope.getValue=function(){
                    if(!$scope.isLoading){
                        $scope.isLoading=true;

                        DataService.post('data/AutomatedQuery/query',{
                            formElementId:$scope.element.id,
                            studyFormId:$scope.studyFormId
                        }).then(function(result){
                                var returnedItem=result.data.item;

                                if(returnedItem.querySummary.queryTypeId==ConfigService.Constants.QUERY_TYPE_EDW_LIST){
                                    // show results in dialog
                                    $scope.openDialog(returnedItem);
                                    $scope.isLoading=false;
                                }else{
                                    DataService.post('data/AutomatedQuery/update',{
                                        formElementId:$scope.element.id,
                                        updateValue:true,
                                        scalarResult:returnedItem.scalarResult,
                                        studyFormId:$scope.studyFormId
                                    }).then(function(result){
                                            var returnedItem=result.data.item;
                                            $rootScope.$broadcast(NotificationService.modifiedElements, returnedItem.modifiedElements);
                                            $scope.isLoading=false;
                                        });
                                }

                            },function(data, status, headers, config){
                                $scope.isLoading=false;
                                console.log('error %o',arguments);
                            });

                    }
                }
            }
        };
    }]);
