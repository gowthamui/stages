myApp.directive('surveyStringWidget', ['$filter','$rootScope','$log','ThemeService','UserService','DataService','$state', function($filter,$rootScope,$log,ThemeService,UserService,DataService,$state) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            template: '<input ng-change="itemChanged(formElement)(formElement)" ng-model-on-blur ng-model="valueSummary.stringValue" type="text">',
            scope:{
                valueSummary:'=',
                valueDefSummary:'=',
                formElement:'=',
                itemChanged:'&'
            },
            controller: function ($scope) {

            }
        };
    }]);