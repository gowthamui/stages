myApp.directive('surveyDatetimeWidget', ['$filter','$rootScope','$log','ThemeService','UserService','DataService','$state', function($filter,$rootScope,$log,ThemeService,UserService,DataService,$state) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            template: '<input type="datetime-local" >',
            scope:{
                valueSummary:'=',
                valueDefSummary:'=',
                formElement:'=',
                itemChanged:'&'
            },
            link: function (scope, element, attrs, ngModel) {
                scope.$watch('ngDisabled', function (newValue,oldValue) {
                    if(newValue==true){
                        element.attr('disabled','');
                    }else{
                        element.removeAttr('disabled','');
                    }
                });

                scope.$watch('valueSummary.dateValue', function (newValue,oldValue) {
                    try {
                        var d = $filter('date')(scope.valueSummary.dateValue, 'yyyy-MM-ddTHH:mm:ss')
                        element.val(d);
                    } catch (x) {
                    }
                });

                element.bind('blur', function () {
                    scope.$apply(function () {
                        var newDate = new Date(element.val());
                        newDate= new Date(newDate.getTime()+newDate.getTimezoneOffset()*60*1000);
                        scope.valueSummary.dateValue = newDate;
                        if (scope.$parent) {
                            if (scope.$parent.form) {
                                scope.$parent.form.$setDirty();
                            }
                        }

                        var fn=scope.itemChanged(scope.formElement);
                        if(fn){
                            fn(scope.formElement);
                        }

                    });
                });
            }
        };
    }]);