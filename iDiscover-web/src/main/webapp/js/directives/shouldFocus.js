myApp.directive('shouldFocus', function ($timeout) {
    return {
        scope: {
            trigger: '@shouldFocus'
        },
        link: function (scope, element, attrs) {
            scope.$watch('trigger', function (value) {
                if (value) {
                    $timeout(function () {
                        try{
                            element[0].focus();
                            element[0].select();
                        }catch(x) {}
                    });
                }
            });
        }
    };
});