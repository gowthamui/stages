'use strict';

/* Directives */

myApp.directive('loadingControl', ['$filter','$log','DataService','ThemeService','MetadataService',function($filter,$log,DataService,ThemeService,MetadataService) {
	return {
		restrict: 'A',
		replace: true,
		terminal:true,
		templateUrl: '../partials/loadingControl.html',
		scope:{
			notLoadingTitle:'=',
			isLoading:'='
		},
		link: function(scope, element, attrs) {
			scope.getTitle=function(){
				var result = "Loading...";
                var maxLength=50;
				if(!scope.isLoading){
					result=scope.notLoadingTitle;
//                    result='Discharge Summary Pilot Study Survey Discharge Summary Pilot Study Survey Discharge Summary Pilot Study Survey';
//                    if(result && result.length>maxLength){
//                        result=result.substr(0,maxLength)+'...';
//                    }
				}
				return result;
			}

			scope.shouldShow=function(){
				return scope.isLoading || (!scope.isLoading && (scope.notLoadingTitle && scope.notLoadingTitle.length>0));

			}
		}
	};
}]);
