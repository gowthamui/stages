myApp.controller('DeleteDialogCtrl', ['$scope', '$modalInstance', 'options', function ($scope, $modalInstance, options) {
	$scope.title=options.title;
	$scope.message=options.message;
	$scope.processing = false;
	$scope.alerts = [];
	$scope.close = function (result) {
		$scope.processing = true;
		$scope.alerts = [];
		options.callback(function(newItem){
			$scope.processing = false;
			$modalInstance.close(newItem);
			if (!$scope.$$phase)
				$scope.$apply();
		},function(error){
			$scope.alerts.push({msg: error.message, type: 'error'});
			$scope.processing = false;
			if (!$scope.$$phase)
				$scope.$apply();
		});
	};
	$scope.cancel = function (result) {
		$modalInstance.close();
	};
	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};
}]);