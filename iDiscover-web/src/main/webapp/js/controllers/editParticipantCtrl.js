myApp.controller('EditParticipantCtrl', ['$scope', '$modalInstance','DataService','itemToEdit', function ($scope, $modalInstance,DataService,itemToEdit) {
	$scope.item=angular.copy(itemToEdit?itemToEdit:{});

	var tempTitle = itemToEdit? 'Edit Participant':'Add Participant';
	$scope.title = tempTitle;
	$scope.alerts = [];
    $scope.form={};
	$scope.processing = false;
	$scope.dialogVisible=true;

	if($scope.item.dateOfBirth){
		if(!angular.isDate($scope.item.dateOfBirth)){
			try{
				$scope.item.dateOfBirth= new Date($scope.item.dateOfBirth);
			}catch(x){

			}
		}
	}

	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;

			$scope.item.dateOfBirth=DataService.truncateDate($scope.item.dateOfBirth);

			DataService.post('data/Participant/update',$scope.item).then(
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

	$scope.dialogChanged = function(visible){
		$scope.dialogVisible=!visible;
	}


}]);