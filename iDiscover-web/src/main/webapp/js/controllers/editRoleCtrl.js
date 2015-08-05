myApp.controller('EditRoleCtrl', ['$scope', '$modalInstance','DataService','itemToEdit', function ($scope, $modalInstance,DataService,itemToEdit) {
	$scope.item=angular.copy(itemToEdit?itemToEdit:{});

	var tempTitle = itemToEdit? 'Edit Role':'Add Role';
	itemToEdit=itemToEdit?itemToEdit:{};
	$scope.item=itemToEdit;
	$scope.title = tempTitle;
	$scope.alerts = [];
    $scope.form={};
	$scope.processing = false;


	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;

			itemToEdit.deptNo=parseInt(itemToEdit.deptNo);
			itemToEdit.facilityId=parseInt(itemToEdit.facilityId);

			DataService.post('data/Role/update',$scope.item).then(
				function (newItem) {
					$scope.processing = false;
					$modalInstance.close(newItem.data);
					if (!$scope.$$phase)
						$scope.$apply();
				},
				function (error) {
					$scope.alerts.push({msg: error.message || 'Unknown Server Error', type: 'error'});
					$scope.processing = false;
					if (!$scope.$$phase)
						$scope.$apply();
				}
			);
		}
	};


	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.close = function (result) {
		$modalInstance.close();
	};
}]);