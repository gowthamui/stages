myApp.directive('surveyYesNoWidget', ['$filter','$rootScope','$log','ThemeService','UserService','DataService','$state', function($filter,$rootScope,$log,ThemeService,UserService,DataService,$state) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/surveyYesNoWidget.html',
            scope:{
                valueSummary:'=',
                valueDefSummary:'=',
                formElement:'=',
                itemChanged:'&'
            },
            controller: function ($scope) {
                $scope.yesNoValueChanged=function(selValue){
                    $scope.valueSummary.boolValue=selValue;
                    var fn=$scope.itemChanged($scope.formElement);
                    if(fn){
                        fn($scope.formElement);
                    }
                }
            }
        };
    }]);