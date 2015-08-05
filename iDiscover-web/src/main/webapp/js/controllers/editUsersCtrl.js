myApp.controller('EditUsersCtrl', ['$scope', '$modalInstance','DataService','itemToEdit', function ($scope, $modalInstance,DataService,itemToEdit) {
	$scope.item=angular.copy(itemToEdit?itemToEdit:{});

	$scope.isNew = itemToEdit?false:true;
	var tempTitle = itemToEdit? 'Edit User':'Add User';
	itemToEdit=itemToEdit?itemToEdit:{};
	$scope.item=itemToEdit;
	if(!$scope.item.notificationPrefs){
		$scope.item.notificationPrefs=[];
	}
	$scope.title = tempTitle;
	$scope.alerts = [];
	$scope.processing = false;
	$scope.notificationTypes=[];


	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;

			itemToEdit.deptNo=parseInt(itemToEdit.deptNo);
			itemToEdit.facilityId=parseInt(itemToEdit.facilityId);

			DataService.post('data/Users/update',$scope.item).then(
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

	$scope.loadNotificationTypes = function () {
		DataService.post('data/NotificationType/search').then(
			function (newItem) {
				$scope.notificationTypes=newItem.data.items;
				$scope.processing = false;

			},
			function (error) {
				$scope.processing = false;
			}
		);
	};

	$scope.findPref=function(notificationTypeId){
		var pref =null;
		angular.forEach($scope.item.notificationPrefs,function(notificationPref){
			if(notificationPref.notificationTypeId==notificationTypeId){
				pref=notificationPref;
			}
		});
		if(!pref){
			pref={
				notificationTypeId:notificationTypeId,
				userProfileId:$scope.item.id,
				emailOn:true
			}
			$scope.item.notificationPrefs.push(pref);
		}
		return pref;
	}

	$scope.isEmailOn = function (notificationType) {
		return $scope.findPref(notificationType.id).emailOn;
	};

	$scope.toggleEmailOn = function (notificationType) {
		var pref=$scope.findPref(notificationType.id);
		pref.emailOn=!pref.emailOn;
		$scope.form.$setDirty();
	};

	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.close = function (result) {
		$modalInstance.close();
	};


	$scope.loadNotificationTypes();
}]);