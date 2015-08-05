myApp.directive('surveyMultiLineStringWidgets', ['$filter','$rootScope','$log','ThemeService','UserService','DataService','$state', function($filter,$rootScope,$log,ThemeService,UserService,DataService,$state) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            template: '<textarea ng-blur="itemChanged(formElement)(formElement)" ng-model-on-blur ng-model="valueSummary.stringValue" type="text" style="height: 170px">',
            scope:{
                valueSummary:'=',
                valueDefSummary:'=',
                formElement:'=',
                itemChanged:'&'
            },
            controller: function ($scope) {
                $log.log("multiline widget");
            }
        };
    }]);