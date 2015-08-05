myApp.controller('ConsentCheckboxDialogCtrl', ['$scope', '$modalInstance','DataService','checkboxItem','formDefId', function ($scope, $modalInstance,DataService,checkboxItem,formDefId) {
	$scope.title = 'Update Item';
	$scope.actionButtonTitle='Save';
	$scope.alerts = [];
    $scope.form={};
	$scope.processing = false;
	$scope.formDefId = formDefId;
	$scope.item=checkboxItem? checkboxItem : {};
	$scope.widgetTypeId=[2,17];

	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;
			$modalInstance.close($scope.item);
		}
	};

	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.close = function () {
		$modalInstance.close();
	};
}]);