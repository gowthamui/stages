myApp.directive('surveyViewSignWidget', ['$filter','$rootScope','$log','ThemeService','UserService','DataService','$state','$modal', function($filter,$rootScope,$log,ThemeService,UserService,DataService,$state,$modal) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/surveyViewAndSignWidget.html',
            scope:{
                valueSummary:'=',
                valueDefSummary:'=',
                formElement:'=',
                itemChanged:'&'
            },
            controller: function ($scope) {
                $scope.formattedValue=function(){
                    var result=null;
                    if($scope.valueSummary!=null && $scope.valueSummary.valueConsentSummary!=null && $scope.valueSummary.valueConsentSummary.complete!=null){
                        if($scope.valueSummary.valueConsentSummary.complete){
                            result= 'Completed on '+$filter('date')($scope.valueSummary.modifiedOn,'short');
                        }
                    }
                    return result;
                }
                $scope.showViewAndSign=function($event){
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }

                    var d = $modal.open({
                        templateUrl:'../partials/viewAndSignDialog.html',
                        controller:'ViewAndSignDialogCtrl',
                        windowClass: 'modalViewContent',
                        backdropClick: false,
                        resolve: {
                            formElement:function(){return $scope.formElement},
                            valueSummary:function(){return $scope.valueSummary},
                            valueDefSummary:function(){return $scope.valueDefSummary},
                            canEdit:function(){return true}}
                    });

                    d.result.then(function (result) {
                        if(result){

                            if(!$scope.valueSummary.valueConsentSummary){
                                $scope.valueSummary.valueConsentSummary={};
                            }
                            $scope.valueSummary.valueConsentSummary.complete=result.result;
                            $scope.valueSummary.modifiedOn=new Date();
                            var fn=$scope.itemChanged($scope.formElement);
                            if(fn){
                                fn($scope.formElement);
                            }
                        }
                    });

                };
            }
        };
    }]);