'use strict';

/* Directives */

myApp.directive('simpleFormattedValue', ['$filter','$log','DataService','MetadataService','$modal',function($filter,$log,DataService,MetadataService,$modal) {
	return {
		restrict: 'A',
		replace: true,
		terminal:true,
		templateUrl: '../partials/simpleFormattedValue.html',
		scope:{
			valueSummary:'=',
			valueDefSummary:'='
		},
		link: function(scope, element, attrs) {
			var currVal = MetadataService.currentValue(scope.valueSummary,scope.valueDefSummary);
			scope.hasValue=currVal.hasValue;
			scope.formattedValue=currVal.formattedValue;
		}
	};
}]);

