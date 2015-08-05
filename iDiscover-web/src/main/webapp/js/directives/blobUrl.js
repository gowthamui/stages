myApp.directive('blobUrl', ['$filter','$log', function ($filter,$log) {
    return {
        restrict: 'A',
        scope: {
            data: '=',
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

            scope.$watch('data', function (newValue,oldValue) {
                var csvUrl="";
                if(newValue){
                    var blob = new Blob([newValue], { type: 'text/csv' });
                    var url = URL.createObjectURL(blob);
                    csvUrl=url;
                }
                element.attr('href',csvUrl);
            });


        }
    };
}]);