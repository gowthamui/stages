'use strict';

/* Directives */

myApp.directive('lookupItem', ['$filter','$log','DataService',function($filter,$log,DataService) {
	return {
		restrict: 'A',
		replace: true,
		templateUrl: '../partials/lookupItem.html',
		scope:{
			lookupValue:'=',
			lookupItemSelected:'&'

		},
		link: function(scope, element, attrs) {
			var s=scope;
			scope.itemSelected=function(item,event){
				console.log('itemSelected:'+item+s);
				s.lookupItemSelected(item,event)(item,event);
			}

			scope.getCaption=function(item){
				if(item.otherValue){
					return item.name+": "+item.otherValue;
				}else{
					return item.name;
				}

			}
		}
	};
}]);
