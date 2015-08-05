'use strict';

/* Directives */

myApp.directive('file', ['$filter','$log','DataService',function($filter,$log,DataService) {
	return {
		scope: {
			file: '=',
			fileChanged: '=',
			accept: '@'
		},
		link: function(scope, el, attrs, ctrl){
			el.bind('change', function(event){
				var files = event.target.files;
				var file = files[0];
				scope.file.fileRef = file ? file : undefined;
				if(scope.fileChanged){
					scope.fileChanged();
				}
			});
		}
	};
}]);
