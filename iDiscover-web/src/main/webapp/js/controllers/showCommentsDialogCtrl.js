myApp.controller('ShowCommentsDialogCtrl', ['$scope', '$modalInstance','DataService','comments','title', function ($scope, $modalInstance,DataService,comments,title) {
	$scope.title = title;
	$scope.comments=comments;
    $scope.form={};

	$scope.close = function (result) {
		$modalInstance.close();
	};


}]);