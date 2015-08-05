myApp.controller('OtherValueDialogCtrl', ['$scope', '$modalInstance', 'otherValue', function ($scope, $modalInstance, otherValue) {
	$scope.otherValue=otherValue;
	$scope.alerts = [];
	$scope.title='Update Other Value';
	$scope.actionButtonTitle='Update';
	$scope.processing = false;
    $scope.form={};
	$scope.save = function (result) {
		$scope.alerts = [];
		$modalInstance.close($scope.otherValue);
	};
	$scope.cancel = function (result) {
		$modalInstance.close();
	};
	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};
}]);