myApp.directive('surveyRatingWidget', ['$filter','MetadataService', function ($filter,MetadataService) {
    return {
        restrict: 'A',
        templateUrl:'../partials/surveyRatingWidget.html',
        scope: {
            valueSummary:'=',
            valueDefSummary:'=',
            itemChanged:'&',
            formElement:'='

        },
        link: function (scope, element, attrs, ngModel) {
            scope.items = [];

            scope.ratingMax=function(){
                var maxVal= MetadataService.getMetadata(scope.valueDefSummary).max;
                if(!maxVal){
                    maxVal=5;
                }
                return maxVal;
            };

            scope.setItems=function(){
                var max=scope.ratingMax();
                if(!max){
                    max=5;
                }
                scope.items=[];
                for(var i=0;i<max; i++){
                    scope.items.push({});
                }
            };


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

                    var fn=scope.itemChanged(scope.formElement);
                    if(fn){
                        fn(scope.formElement);
                    }
                }
            };


            scope.setItems();

        }
    };
}]);