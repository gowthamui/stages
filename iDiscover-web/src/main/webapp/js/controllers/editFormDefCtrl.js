myApp.controller('EditFormDefCtrl', ['$scope','$rootScope','$modal', '$modalInstance','DataService','ThemeService','itemToEdit','itemToCopy', function ($scope,$rootScope,$modal, $modalInstance,DataService,ThemeService,itemToEdit,itemToCopy) {
	$scope.item=angular.copy(itemToEdit?itemToEdit:{});

	if(!$scope.item.organizationSummary){
		$scope.item.organizationSummary={};
	}

	var tempTitle = $scope.item.id>0 ? 'Edit Template':'Add Template';
	if(itemToCopy){
		tempTitle="Save Copy of '"+itemToCopy.name+"' As...";
		$scope.item.formDefIdToCopy=itemToCopy.id;
	}
	$scope.title = tempTitle;
	$scope.alerts = [];
	$scope.processing = false;
    $scope.form={};
	$scope.organizations=[];
	$scope.tableName = 'FORM_DEF';
	$scope.query = $scope.item.id;
	$scope.filterByRows = [1];
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

			console.log('bout to save %o:',$scope.item);
			DataService.post('data/FormDef/update',$scope.item).then(
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
			modalFade: false,
			backdropClick: false,
			resolve: {query:function(){return $scope.query;},tableName:function(){return $scope.tableName;},filterByRows:function(){return $scope.filterByRows;}}
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


	$scope.highlightRow=function(options,index){
		setTimeout(function(){
			options.selectItem(index,true);
			if (!$scope.$$phase)
				$scope.$apply();

		},10);
	}




}]);