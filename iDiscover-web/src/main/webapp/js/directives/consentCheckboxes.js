'use strict';

/* Directives */

myApp.directive('consentCheckboxes', ['$filter','$rootScope','$log','$modal',function($filter,$rootScope,$log,$modal) {
	return {
		replace: true,
		templateUrl: '../partials/consentCheckboxes.html',
		scope:{
			consentMetadata:'=',
			formDefId:'=',
			dialogChanged:'&'
		},
		link: function(scope, element, attrs) {
			scope.changeElement=function(item){

			};

			scope.removeItem=function(item){
				var index = scope.consentMetadata.checkboxList.indexOf(item);
				if(index>-1){
					scope.consentMetadata.checkboxList.splice(index,1);
				}
			};

			scope.editItem=function(item){
				var isNew=item==null;
				scope.dialogChanged(true)(true);
				var d = $modal.open({
					keyboard:false,
					templateUrl:'../partials/consentCheckboxDialog.html',
					controller:'ConsentCheckboxDialogCtrl',
					backdropClick: false,
					resolve: {checkboxItem: function(){ return item},formDefId:function(){return scope.formDefId}}
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;
				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					if(result){
						if(isNew){
							scope.consentMetadata.checkboxList.push(result);
						}

					}
					scope.dialogChanged(false)(false);
				});
			};
		}
	};
}]);
