myApp.directive('expressionInstructions', ['$filter','$log', function ($filter,$log) {
    return {
        replace:true,
        scope:{
            isCondition:'='
        },
        templateUrl: '../partials/expressionInstructions.html',

        link: function (scope, element, attrs, ngModel) {
            $log.log(scope);
        }
    };
}]);