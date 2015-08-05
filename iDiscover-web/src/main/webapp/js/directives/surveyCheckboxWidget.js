myApp.directive('surveyCheckboxWidget', ['$filter','$rootScope','$log','ThemeService','UserService','DataService','$state', function($filter,$rootScope,$log,ThemeService,UserService,DataService,$state) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            template: '<input ng-change="itemChanged(formElement)(formElement)" type="checkbox" ng-model="valueSummary.boolValue">',
            scope:{
                valueSummary:'=',
                valueDefSummary:'=',
                itemChanged:'&',
                formElement:'='
            },
            controller: function ($scope) {
            }
        };
    }]);