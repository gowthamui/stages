myApp.controller('EditOrganizationCtrl', ['$scope','$rootScope','$modal', '$modalInstance','DataService','ThemeService','itemToEdit', function ($scope,$rootScope,$modal,$modalInstance,DataService,ThemeService,itemToEdit) {
	$scope.item=angular.copy(itemToEdit?itemToEdit:{});

	var tempTitle = itemToEdit? 'Edit Organization':'Add Organization';
	$scope.title = tempTitle;
	$scope.alerts = [];
	$scope.processing = false;
	$scope.tableName = 'ORGANIZATION';
    $scope.form={};
	$scope.query=$scope.item.id;
	$scope.accessIcon=ThemeService.accessIcon;

	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;

			console.log('bout to save %o:',$scope.item);
			DataService.post('data/Organization/update',$scope.item).then(
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

	$scope.dialogChanged = function(visible) {
		$scope.hideDialog=visible;
		if(!$scope.$$phase){
			$scope.$apply();
		}
	}

	$scope.openConfigureAccess=function(){
		$scope.dialogChanged(true);
		var d = $modal.open({
			keyboard:false,
			templateUrl:'../partials/configureAccessDialog.html',
			controller:'ConfigureAccessDialogCtrl',
			backdropClick: false,
			resolve: {query:function(){return $scope.query;},tableName:function(){return $scope.tableName;}}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			$scope.dialogChanged(false);
		},function(){
			$scope.dialogChanged(false);
		});
	};

	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.close = function (result) {
		$modalInstance.close();
	};


}]);