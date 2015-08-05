myApp.directive('scrollBottom', ['$filter', function ($filter) {
	return {
		restrict: 'A',

		link: function (scope, element, attrs, ngModel) {
			scope.$watch(attrs.itemToWatch, function (newValue, oldValue) {
				try {
					if (newValue && element.length > 0) {
						setTimeout(function () {
							var objDiv = element[0];
							objDiv.scrollTop = objDiv.scrollHeight;
						}, 100);

					}
				} catch (x) {
					console.log(x);
				}
			});
		}
	};
}]);