'use strict';

myApp.directive('initialsPad', [function() {
    return {
        restrict: 'A',
        scope:{
            initialDelegate:'='
        },

        link: function(scope, element, attrs) {
            var canvas = element.get(0);
            var ctx = canvas.getContext("2d");
            var initialPad = new SignaturePad(canvas);

            if (scope.initialDelegate.valueId > 0) {
                var img = new Image();
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                };
                img.src='ws/clientData/image/ValueInitials/' + scope.initialDelegate.valueId;
            }
            scope.initialDelegate.pad = initialPad;
        }
    };
}]);
