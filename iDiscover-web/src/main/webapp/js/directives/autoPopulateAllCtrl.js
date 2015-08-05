'use strict';

/* Directives */

myApp.directive('autoPopulateAllCtrl', ['$filter','$rootScope','$log','DataService','$modal','ThemeService','MetadataService','$q','$timeout','NotificationService', 'ConfigService', function($filter,$rootScope,$log,DataService,$modal,ThemeService,MetadataService,$q,$timeout,NotificationService,ConfigService) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/autoPopulateAllCtrl.html',
            scope:{

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

                $scope.updateAll=function(){
                    if(!$scope.isLoading){
                        $scope.isLoading=true;
                        $rootScope.$broadcast(NotificationService.autoPopulateAll, {});
                        $timeout(function(){
                            $scope.isLoading=false;
                        },2500);
                    }
                }
            }
        };
    }]);
