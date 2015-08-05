'use strict';

/* Directives */

myApp.directive('consentSignatures', ['$filter','$rootScope','$log','$modal', function($filter,$rootScope,$log,$modal) {
	return {
		replace: true,
		templateUrl: '../partials/consentSignatures.html',
		scope:{
			consentMetadata:'=',
			formDefId:'=',
			dialogChanged:'&'
		},
		link: function(scope, element, attrs) {
			scope.changeElement=function(item){

			};

			scope.removeItem=function(item){
				var index = scope.consentMetadata.signatureList.indexOf(item);
				if(index>-1){
					scope.consentMetadata.signatureList.splice(index,1);
				}
			};

			scope.editItem=function(item){
				var isNew=item==null;
				scope.dialogChanged(true)(true);
				var d = $modal.open({
					keyboard:false,
					templateUrl:'../partials/consentSignatureDialog.html',
					controller:'ConsentSignatureDialogCtrl',
					backdropClick: false,
					resolve: {signatureItem:function(){return item},formDefId:function(){return scope.formDefId}}
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;
				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					if(result){
						if(isNew){
							scope.consentMetadata.signatureList.push(result);
						}

					}
					scope.dialogChanged(false)(false);
				});
			};
		}
	};
}]);
