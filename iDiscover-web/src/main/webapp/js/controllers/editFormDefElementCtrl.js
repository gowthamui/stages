myApp.controller('EditFormDefElementCtrl', ['$scope', '$modalInstance','item', function ($scope, $modalInstance,item) {
	$scope.title = 'Edit Question';
	$scope.alerts = [];
	$scope.processing = false;

	$scope.close = function (result) {
		$modalInstance.close();
	};
}]);