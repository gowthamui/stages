'use strict';

/* Directives */

myApp.directive('participantLookup', ['$filter','$rootScope','$log','DataService','$document','$modal','ThemeService', function($filter,$rootScope,$log,DataService,$document,$modal,ThemeService) {
	return {
		replace: true,
		templateUrl: '../partials/participantLookup.html',
		scope:{
			dialogChanged:'&',
			participant: '='
		},
		link: function(scope, element, attrs) {
			scope.searchIcon=ThemeService.searchIcon;

			scope.open=function(){
				if(scope.dialogChanged){
					scope.dialogChanged(true)(true);
				}
				var d = $modal.open({
					keyboard:false,
					templateUrl:'../partials/participantSearch.html',
					controller:'ParticipantSearchCtrl',
					backdropClick: false,
					resolve: {participant:function(){return scope.participant}}
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;
				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					if(result){
						result.idTag=result.empi;
						scope.participant=result;
					}
					scope.dialogChanged(false)(false);
				});
			}
		}
	};
}]);
