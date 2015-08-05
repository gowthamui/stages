myApp.controller('EditLookupGroupCtrl', ['$scope','$rootScope','$modal','DataService','ThemeService', '$modalInstance','itemToEdit', function ($scope,$rootScope,$modal,DataService,ThemeService, $modalInstance,itemToEdit) {
	$scope.item=angular.copy(itemToEdit?itemToEdit:{});

	var tempTitle = itemToEdit? 'Edit Lookup':'Add Lookup';
	itemToEdit=itemToEdit?itemToEdit:{isTemplate:true};
	if(!itemToEdit.organizationSummary){
		itemToEdit.organizationSummary={};
	}
	$scope.item=itemToEdit;
	$scope.title = tempTitle;
	$scope.alerts = [];
	$scope.processing = false;
    $scope.form={};
	$scope.loading = false;
	$scope.tableName = 'LOOKUP_GROUP';
	$scope.query = itemToEdit.id;
	$scope.organizations=[];
	$scope.dialogVisible=true;
	$scope.accessIcon=ThemeService.accessIcon;

	DataService.post('data/Organization/search',{showOnlyItemsUserCanEdit:true}).then(function(result){
		$scope.organizations=result.data.items;
		if(!$scope.$$phase){
			$scope.$apply();
		}
	});

	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;
			var itemToSave = {};
			angular.copy($scope.item,itemToSave);
			angular.forEach(itemToSave.values,function(item){
				item.allowsText=item.allowsText==true?1:0;
			});

			DataService.post('data/LookupGroup/update',itemToSave).then(
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

	$scope.dialogChanged = function(visible){
		$scope.dialogVisible=!visible;
	}

	$scope.close = function (result) {
		$modalInstance.close();
	};
}]);