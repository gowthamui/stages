myApp.directive('surveySliderWidget', [function() {
	return {
		restrict : 'A',
		replace : true,
		template : '<div><input ng-change="itemChanged(formElement)(formElement)" ng-model="valueSummary.numberValue" type="range" min={{valueDefSummary.metadataObject.min}} max={{valueDefSummary.metadataObject.max}}> <span ng-show="valueSummary.numberValue">{{valueSummary.numberValue}}</span></div>',
		scope : {
			valueSummary : '=',
			valueDefSummary : '=',
			itemChanged : '&',
			formElement : '='
		}
	};
}]);