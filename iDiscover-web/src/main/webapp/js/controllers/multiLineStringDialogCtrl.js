myApp.controller('MultiLineStringDialogCtrl', ['$scope', '$modalInstance','DataService','caption','title','value', function ($scope, $modalInstance,DataService,caption,title,value) {
	$scope.title = 'Update Value';
	$scope.caption = caption;
	$scope.data={};
    $scope.data.value = value;
	$scope.alerts = [];
	$scope.processing = false;

	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;
			$modalInstance.close($scope.data.value);
		}
	};

	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.close = function (result) {
		$modalInstance.close();
	};


}]);