myApp.controller('NotificationEditorCtrl', ['$scope', '$modalInstance','DataService','studyDefId','srcStudyDefFormDefId','srcFormDefElementId','notificationTypeId',
	function ($scope, $modalInstance,DataService,studyDefId,srcStudyDefFormDefId,srcFormDefElementId,notificationTypeId) {
	$scope.title = 'Edit Schedule';
	$scope.alerts = [];
	$scope.processing = false;
	$scope.objectStateTypes = [];
	$scope.dialogVisible=true;
	$scope.selectedItem={};

    $scope.data={
        beforeRef:0,
        fromRef:0,
        afterRef:0,
        objectStateTypeId:null
    };

	$scope.srcStudyDefFormDefId=srcStudyDefFormDefId;
	$scope.srcFormDefElementId=srcFormDefElementId;
	$scope.notificationTypeId=notificationTypeId;
	$scope.studyDefId=studyDefId;
	$scope.isLoading=false;
    $scope.selectableDataTypes=[3,10];
    $scope.selectableElementTypes=[2,3];

	$scope.loadObjectStateTypes=function(){
		$scope.objectStateTypes = [];
		if($scope.selectedItem.item){
			var tableName = 'FORM';
			if($scope.selectedItem.item.tarFormDefElementId>0){
				tableName = 'FORM_ELEMENT';
			}
			DataService.post('data/ObjectStateType/search',{tableName:tableName}).then(function(result){
				$scope.objectStateTypes =result.data.items;
				if(!$scope.$$phase){
					$scope.$apply();
				}
			});
		}
	}

	$scope.isValid=function(form){
		return !form.$invalid && $scope.selectedItem.item;
	}

	$scope.showObjectStateTypes=function(){
		return $scope.selectedItem.item!=null && $scope.selectedItem.item.tarDataTypeId==10;
	}

	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.dialogChanged = function(visible){
		$scope.dialogVisible=!visible;
	}

	$scope.save = function () {
		console.log($scope.selectedItem.item);
		DataService.post('data/Notification/update',{
			notificationTypeId:$scope.notificationTypeId,
			srcStudyDefFormDefId:$scope.srcStudyDefFormDefId,
			srcFormDefElementId:$scope.srcFormDefElementId,
			tarStudyDefFormDefId:$scope.selectedItem.item.tarStudyDefFormDefId,
			tarFormDefElementId:$scope.selectedItem.item.tarFormDefElementId,
			secondsBeforeRef:$scope.data.beforeRef*24*60*60,
			secondsFromRef:$scope.data.fromRef*24*60*60,
			secondsAfterRef:$scope.data.afterRef*24*60*60,
			objectStateTypeId:$scope.data.objectStateTypeId
		}).then(function(result){
			if(result.data.item && result.data.item.id>0){
				$scope.selectedItem.item=result.data.item;
				$modalInstance.close($scope.selectedItem.item);
			}
		});

	};


	$scope.cancel = function () {
		$modalInstance.close();
	};

	$scope.$watch('selectedItem.item',function(newValue,oldValue){
		$scope.loadObjectStateTypes();
	});

	$scope.loadNotification=function(){
		$scope.isLoading=true;
		DataService.post('data/Notification/view',{
			notificationTypeId:$scope.notificationTypeId,
			srcStudyDefFormDefId:$scope.srcStudyDefFormDefId,
			srcFormDefElementId:$scope.srcFormDefElementId
		}).then(function(result){
			if(result.data.item && result.data.item.id>0){
				$scope.selectedItem.item=result.data.item;
				if($scope.selectedItem.item.secondsAfterRef){
					$scope.data.afterRef=$scope.selectedItem.item.secondsAfterRef/(24*60*60);
				}
				if($scope.selectedItem.item.secondsBeforeRef){
					$scope.data.beforeRef=$scope.selectedItem.item.secondsBeforeRef/(24*60*60);
				}
				if($scope.selectedItem.item.secondsFromRef){
					$scope.data.fromRef=$scope.selectedItem.item.secondsFromRef/(24*60*60);
				}
				$scope.data.objectStateTypeId=$scope.selectedItem.item.objectStateTypeId;
			}
			$scope.isLoading=false;
			if(!$scope.$$phase){
				$scope.$apply();
			}
		});
	}

	$scope.loadNotification();
}]);