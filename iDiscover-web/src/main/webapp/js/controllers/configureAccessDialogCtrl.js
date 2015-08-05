myApp.controller('ConfigureAccessDialogCtrl', ['$scope', '$modalInstance','DataService','query','tableName', function ($scope, $modalInstance,DataService,query,tableName) {
	$scope.title = 'Configure Access';
	$scope.alerts = [];
	$scope.processing = false;
	$scope.query= query;
    $scope.form={};
	$scope.tableName= tableName;


	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.close = function () {
		$modalInstance.close();
	};
}]);