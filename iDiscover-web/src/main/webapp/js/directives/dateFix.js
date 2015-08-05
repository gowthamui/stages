myApp.directive('dateFix', ['$filter', function ($filter) {
	return {
		restrict: 'A',
		scope: {
			date: '=',
			ngDisabled:'='
		},


		link: function (scope, element, attrs, ngModel) {

			scope.$watch('ngDisabled', function (newValue,oldValue) {
				if(newValue==true){
					element.attr('disabled','');
				}else{
					element.removeAttr('disabled','');
				}
			});

			scope.$watch('date', function (newValue,oldValue) {
				try {
					var d = $filter('date')(scope.date, 'yyyy-MM-dd')
					element.val(d);
				} catch (x) {
				}
			});

			element.bind('blur', function () {
				scope.$apply(function () {
					var newDate = new Date(element.val());
					newDate= new Date(newDate.getTime()+newDate.getTimezoneOffset()*60*1000);
					scope.date = newDate;
					if (scope.$parent) {
						if (scope.$parent.form) {
							scope.$parent.form.$setDirty();
						}
					}

				});
			});

		}
	};
}]);