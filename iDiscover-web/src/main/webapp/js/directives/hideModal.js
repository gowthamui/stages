'use strict';

/* Directives */

myApp.directive('hideModal', ['$filter','$log','DataService',function($filter,$log,DataService) {
    return {
        scope: {
            shouldShow: '='
        },
        link: function(scope, el, attrs, ctrl){
            scope.$watch('shouldShow',function(newValue,oldValue){
                if(newValue && $(el).parent() && $(el).parent().parent() && $(el).parent().parent().parent()){
                    $(el).parent().parent().parent().show();
                }else if( $(el).parent() && $(el).parent().parent() && $(el).parent().parent().parent()){
                    $(el).parent().parent().parent().hide();
                }
            });
        }
    };
}]);
