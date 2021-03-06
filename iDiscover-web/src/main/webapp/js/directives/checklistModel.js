myApp.directive('checklistModel', ['$parse', '$compile', function($parse, $compile) {
	function contains(arr, item) {
		if (angular.isArray(arr)) {
			for (var i = 0; i < arr.length; i++) {
				if (angular.equals(arr[i], item)) {
					return true;
				}
			}
		}
		return false;
	}

	function add(arr, item) {
		arr = angular.isArray(arr) ? arr : [];
		for (var i = 0; i < arr.length; i++) {
			if (angular.equals(arr[i], item)) {
				return arr;
			}
		}
		arr.push(item);
		return arr;
	}

	function remove(arr, item) {
		if (angular.isArray(arr)) {
			for (var i = 0; i < arr.length; i++) {
				if (angular.equals(arr[i], item)) {
					arr.splice(i, 1);
					break;
				}
			}
		}
		return arr;
	}

	function postLinkFn(scope, elem, attrs) {
		$compile(elem)(scope);

		var getter = $parse(attrs.checklistModel);
		var setter = getter.assign;

		var value = $parse(attrs.checklistValue)(scope.$parent);

		scope.$watch('checked', function(newValue, oldValue) {
			if (newValue === oldValue) {
				return;
			}
			var current = getter(scope.$parent);
			if (newValue === true) {
				setter(scope.$parent, add(current, value));
			} else {
				setter(scope.$parent, remove(current, value));
			}
		});

		scope.$parent.$watch(attrs.checklistModel,
				function(newArr, oldArr) {
					scope.checked = contains(newArr, value);
				}, true);
	}

	return {
		restrict : 'A',
		priority : 1000,
		terminal : true,
		scope : true,
		compile : function(tElement, tAttrs) {
			if (tElement[0].tagName !== 'INPUT' || !tElement.attr('type', 'checkbox')) {
				throw 'checklist-model should be applied to `input[type="checkbox"]`.';
			}

			if (!tAttrs.checklistValue) {
				throw 'You should provide `checklist-value`.';
			}

			tElement.removeAttr('checklist-model');

			tElement.attr('ng-model', 'checked');

			return postLinkFn;
		}
	};
}]);