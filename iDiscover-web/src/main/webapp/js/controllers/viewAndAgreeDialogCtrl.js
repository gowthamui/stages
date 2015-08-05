myApp.controller('ViewAndAgreeDialogCtrl', ['$scope', '$modalInstance','DataService','MetadataService','valueSummary','valueDefSummary','canEdit',
	function ($scope, $modalInstance,DataService,MetadataService,valueSummary,valueDefSummary,canEdit) {
	$scope.title = valueDefSummary.name;
	$scope.canEdit=canEdit;
	$scope.processing = false;
	$scope.filePath= 'ws/clientData/file/ValueFile/'+valueDefSummary.fileValueId;

	$scope.agree = function () {
		$scope.processing = true;
		$modalInstance.close({result:true});
	};

	$scope.disagree = function () {
		$scope.processing = true;
		$modalInstance.close({result:false});
	};

	$scope.close = function (result) {
		$modalInstance.close();
	};


}]);