myApp.directive('ratingWidget', ['$filter', function ($filter) {
	return {
		restrict: 'A',
		templateUrl:'../partials/ratingWidget.html',
		scope: {
			maxValue:'=',
			valueSummary:'=',
			selectionChanged:'&',
			isReadOnly:'='

		},
		link: function (scope, element, attrs, ngModel) {
			scope.items = [];

			scope.setItems=function(){
				var max=scope.maxValue;
				if(!scope.maxValue){
					max=5;
				}
				scope.items=[];
				for(var i=0;i<max; i++){
					scope.items.push({});
				}
			};
			scope.$watch('maxValue', function (newValue,oldValue) {
				scope.setItems();
			});

			scope.isSelected=function(index){
				var result='fa fa-star-o';
				if(index+1<=scope.valueSummary.numberValue){
					result='fa fa-star';
				}
				return result;
			};

			scope.selectValue=function(index){
				if(!scope.isReadOnly){
					if(scope.valueSummary.numberValue==index+1){
						scope.valueSummary.numberValue=null;
					}else{
						scope.valueSummary.numberValue=index+1;
					}

					if(scope.selectionChanged){
						scope.selectionChanged(scope.valueSummary.numberValue)(scope.valueSummary.numberValue);
					}
				}
			};

		}
	};
}]);