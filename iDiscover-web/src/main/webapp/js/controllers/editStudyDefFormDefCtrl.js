myApp.controller('EditStudyDefFormDefCtrl', ['$scope', '$modalInstance','DataService','itemToEdit','studyDefId', 'forms', function ($scope, $modalInstance,DataService,itemToEdit,studyDefId, forms) {
	$scope.item=angular.copy(itemToEdit?itemToEdit:{formTypeSummary:{id:1},formDefSummary:{},studyDefId:studyDefId});

	$scope.dialogVisible=true;
	$scope.isNew =  !itemToEdit;
	var tempTitle = 'Form Properties';
	$scope.title = tempTitle;
	$scope.alerts = [];
	$scope.processing = false;
    $scope.form={};
	$scope.formTypes = [];
    $scope.formDefs =[];


	DataService.formTypes(function(data){
		$scope.formTypes=data;
		if(!$scope.$$phase){
			$scope.$apply();
		}
	});

	DataService.post('data/FormDef/search',{formDefTypeId:1}).then(function(result){
		$scope.formDefs =result.data.items;
		if(!$scope.$$phase){
			$scope.$apply();
		}

	},function(data, status, headers, config){
		console.log('error %o',arguments);
	});

	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;

			DataService.post('data/StudyDefFormDef/update',$scope.item).then(
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

	$scope.dialogChanged = function(visible){
		$scope.dialogVisible=!visible;
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
	};

	$scope.nameChange = function() {
		angular.forEach(forms, function(value, key) {
			if (value.formDefSummary.name == $scope.item.formDefSummary.name) {
				$scope.alerts.push({
					msg: 'The name "' + $scope.item.formDefSummary.name + '" has already been used on this study',
					type: 'warning'
				});
			}
		});
	};
}]);