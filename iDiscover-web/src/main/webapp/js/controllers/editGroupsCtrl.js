myApp.controller('EditGroupsCtrl', ['$scope', '$modalInstance','DataService','itemToEdit', function ($scope, $modalInstance,DataService,itemToEdit) {
	$scope.item=angular.copy(itemToEdit?itemToEdit:{});

	var tempTitle = itemToEdit? itemToEdit.name:'Add';
	itemToEdit=itemToEdit?itemToEdit:{};
	$scope.item=itemToEdit;
	$scope.title = tempTitle;
	$scope.alerts = [];
	$scope.processing = false;
	$scope.loading=false;
    $scope.form={};
	$scope.gridData = [];
	$scope.selectedItems = [];
	$scope.allUsers = [];
	$scope.formData = {};
	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
		multiSelect: false,
		enableRowReordering:false,
		showColumnMenu: false,
		enableSorting:true,
		selectedItems: $scope.selectedItems,
		columnDefs: [
			{field: 'usersSummary.id', displayName: 'Id'},
			{field: 'usersSummary.firstName', displayName: 'First Name'},
			{field: 'usersSummary.lastName', displayName: 'Last Name'},
			{field: 'usersSummary.facilityId', displayName: 'Facility No'},
			{field: 'usersSummary.deptNo', displayName: 'Dept No'}
		],
		enableSorting:true
	};


	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;

			itemToEdit.deptNo=parseInt(itemToEdit.deptNo);
			itemToEdit.facilityId=parseInt(itemToEdit.facilityId);

			DataService.post('data/Groups/update',$scope.item).then(
				function (newItem) {
					$scope.processing = false;
					$modalInstance.close(newItem.data);
					console.log(newItem);
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

	$scope.users =function(){
		var result = [];
		angular.forEach($scope.allUsers,function(user){
			var found=false;
			angular.forEach($scope.gridData,function(userGroup){
				if(userGroup.usersSummary.id==user.id){
					found=true;
				}
			});
			if(!found){
				result.push(user);
			}
		});
		return result;
	}

	$scope.canRemove=function(){
		return $scope.selectedItems.length>0;
	}

	$scope.canAdd=function(){
		return $scope.formData.newUser!=null;
	}

	$scope.addUser=function(){
		if($scope.formData.newUser){
			var newItem= {groupId:$scope.item.id,usersSummary:$scope.formData.newUser};
			$scope.gridData.push(newItem);
			DataService.post('data/UsersGroups/update',newItem).then(
				function (result) {
					newItem.id=result.data.item.id;
					if (!$scope.$$phase)
						$scope.$apply();
				},
				function (error) {
					$scope.alerts.push({msg: error.message || 'Unknown Server Error', type: 'error'});
					if (!$scope.$$phase)
						$scope.$apply();
				}
			);
		}
		$scope.formData.newUser=null;
	}

	$scope.remove=function(){
		if($scope.canRemove()){
			var selectedItem =$scope.selectedItems[0];
			var index =$scope.gridData.indexOf(selectedItem);
			$scope.gridData.splice(index,1);

			if(index>$scope.gridData.length-1){
				index=$scope.gridData.length-1;
			}

			if(index>= 0 && $scope.gridData.length>0){
				$scope.highlightRow(index);
			}

			DataService.post('data/UsersGroups/delete',selectedItem).then(
				function (result) {
					if (!$scope.$$phase)
						$scope.$apply();
				},
				function (error) {
					$scope.alerts.push({msg: error.message || 'Unknown Server Error', type: 'error'});
					if (!$scope.$$phase)
						$scope.$apply();
				}
			);

		}
	}

	$scope.highlightRow=function(index){
		setTimeout(function(){
			$scope.gridOptions.selectItem(index,true);
			if (!$scope.$$phase)
				$scope.$apply();

		},20);
	}

	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.close = function (result) {
		$modalInstance.close();
	};

	if($scope.item.id>0){
		$scope.loading = false;
		DataService.post('data/UsersGroups/search',{groupId:$scope.item.id}).then(
			function (newItem) {
				$scope.gridData=newItem.data.items;
				$scope.loading = false;
				if (!$scope.$$phase)
					$scope.$apply();
			},
			function (error) {
				$scope.alerts.push({msg: error.message || 'Unknown Server Error', type: 'error'});
				$scope.loading = false;
				if (!$scope.$$phase)
					$scope.$apply();
			}
		);
	}

	// get users
	DataService.post('data/Users/search',{}).then(
		function (newItem) {
			$scope.allUsers=newItem.data.items;
			if (!$scope.$$phase)
				$scope.$apply();
		},
		function (error) {
			$scope.alerts.push({msg: error.message || 'Unknown Server Error', type: 'error'});
			if (!$scope.$$phase)
				$scope.$apply();
		}
	);
}]);