myApp.directive('requiredIndicator', ['$filter', function ($filter) {
    return {
        restrict: 'A',
        replace:true,
        template:'<i style="margin-left: 3px" class="fa fa-asterisk requiredIndicator" ng-show="isRequired"></i>',
        scope:{
            isRequired:'='
        },
        link: function (scope, element, attrs, ngModel) {
        }
    };
}]);