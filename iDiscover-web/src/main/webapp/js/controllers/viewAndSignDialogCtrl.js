myApp.controller('ViewAndSignDialogCtrl', ['$scope', '$modalInstance','DataService','formElement','valueSummary','valueDefSummary','canEdit', function ($scope, $modalInstance,DataService,formElement,valueSummary,valueDefSummary,canEdit) {
	$scope.title = valueDefSummary.name;

	$scope.canSign=true;
	$scope.canResign=false;

	if(valueSummary.valueConsentSummary){
		if(valueSummary.valueConsentSummary.complete){
			$scope.canSign=false;
			$scope.canResign=true;
		}else{
			$scope.canSign=true;
			$scope.canResign=false;
		}
	}

	$scope.processing = false;
	$scope.filePath= 'ws/clientData/file/SignedDocument/'+formElement.id;

	$scope.markAsSigned = function () {
		$scope.processing = true;
		$modalInstance.close({result:true});
	};

	$scope.resign = function () {
		$scope.processing = true;
		$modalInstance.close({result:false});
	};

	$scope.close = function (result) {
		$modalInstance.close();
	};


}]);