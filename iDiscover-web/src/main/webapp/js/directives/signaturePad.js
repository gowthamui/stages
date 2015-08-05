'use strict';

/* Directives */

myApp.directive('signaturePad', ['$filter','$document','$log','DataService','$modal',function($filter,$document,$log,DataService,$modal) {
	return {
		restrict: 'A',
        scope:{
            signatureDelegate:'='
        },

		link: function(scope, element, attrs) {
			var canvas = element.get(0);
			var ctx=canvas.getContext("2d");
			var signaturePad = new SignaturePad(canvas);

            if(scope.signatureDelegate.signaturePath){
                var img=new Image();
                img.onload=function(){
                    ctx.drawImage(img,0,0);
                };
                img.src=scope.signatureDelegate.signaturePath;
            }
			else if(scope.signatureDelegate.signatureValueId>0){
				var img=new Image();
				img.onload=function(){
					ctx.drawImage(img,0,0);
				};
				img.src='ws/clientData/image/ValueSignature/'+scope.signatureDelegate.signatureValueId;
			}
			scope.signatureDelegate.pad=signaturePad;
		}
	};
}]);
