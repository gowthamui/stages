// override the default input to update on blur
myApp.directive('ngModelOnblur', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
        priority:1,
		link: function(scope, elm, attr, ngModelCtrl) {
			if (attr.type === 'radio' || attr.type === 'checkbox') return;

			elm.unbind('input').unbind('keydown').unbind('change');
			var currentVal = elm.val();
			elm.bind('blur', function() {
				if (elm.val() != currentVal) {
					currentVal = elm.val();
					scope.$apply(function() {
						ngModelCtrl.$setViewValue(elm.val());
					});
				}
			});
		}
	};
});
