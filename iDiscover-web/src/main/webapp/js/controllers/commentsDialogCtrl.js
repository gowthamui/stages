myApp.controller('CommentsDialogCtrl', ['$scope', '$modalInstance','DataService','comments','title','isReadOnly', function ($scope, $modalInstance,DataService,comments,title,isReadOnly) {
	$scope.title = title;
	$scope.actionButtonTitle='Submit';
	$scope.stuff='';
	$scope.alerts = [];
    $scope.processing = false;
    $scope.data={
        comments:comments
    };
	$scope.canEdit=isReadOnly? false:true;

	$scope.save = function () {
		if ($scope.form.$valid) {

			$scope.alerts = [];
			$scope.processing = true;
			$modalInstance.close({
				comments:$scope.data.comments
			});

		}
	};

	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};


	$scope.close = function () {
		$modalInstance.close();
	};


}]);