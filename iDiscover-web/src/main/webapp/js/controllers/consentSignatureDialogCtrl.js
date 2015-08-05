myApp.controller('ConsentSignatureDialogCtrl', ['$scope', '$modalInstance','DataService','signatureItem','formDefId', function ($scope, $modalInstance,DataService,signatureItem,formDefId) {
	$scope.title = 'Update Item';
	$scope.actionButtonTitle='Save';
	$scope.alerts = [];
	$scope.processing = false;
	$scope.formDefId = formDefId;
	$scope.item=signatureItem? signatureItem : {};
	$scope.widgetTypeId=6;
    $scope.form={};
	$scope.footerElementWidgetTypeId='*';

	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;
			$modalInstance.close($scope.item);
		}
	};

	$scope.toggleHidePrintedName=function(){
		$scope.item.hidePrintedName=!$scope.item.hidePrintedName;
	}
	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.close = function () {
		$modalInstance.close();
	};
}]);