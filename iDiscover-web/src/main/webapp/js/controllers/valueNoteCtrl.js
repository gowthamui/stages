myApp.controller('ValueNoteCtrl', ['$scope', '$modalInstance','DataService','element','title','isReadOnly','comment', function ($scope, $modalInstance,DataService,element,title,isReadOnly,comment) {
	$scope.title = title;
	$scope.actionButtonTitle='Submit';
	$scope.alerts = [];
	$scope.processing = false;
    $scope.data={
        hasValueNote : false,
        notSpecialType : false,
        notAvailable : false
    };

	$scope.valueNoteId=null;

	$scope.hasValue=false;
	if(element.currentValueSummary){
		$scope.data.previousComments=element.currentValueSummary.comments;
		$scope.data.comments=element.currentValueSummary.comments;

		if(element.currentValueSummary.id>0){
			$scope.hasValue = true;
		}
		$scope.data.notAvailable=element.currentValueSummary.valueNoteId==1;
		$scope.data.hasValueNote =element.currentValueSummary.valueNoteId==1;
		$scope.data.valueNoteId=element.currentValueSummary.valueNoteId;
	}

    if(comment){
        $scope.data.comments=comment;
    }

	if(element.elementSummary.valueDefSummary){
		$scope.data.notSpecialType = element.elementSummary.valueDefSummary.dataTypeId!=10 && element.elementSummary.valueDefSummary.dataTypeId!=5;
	}

	$scope.canEdit=isReadOnly? false:true;
	$scope.data.notAvailable=false;
	$scope.data.clearValue=false;

	$scope.notAvailableVisible=function(){
		return $scope.canEdit && !$scope.data.clearValue && !$scope.data.hasValueNote;
	};

	$scope.availableVisible=function(){
		return $scope.canEdit && !$scope.data.clearValue && $scope.data.hasValueNote;
	};

	$scope.clearValueVisible=function(){
		return $scope.canEdit && $scope.hasValue && !$scope.data.notAvailable && !$scope.data.hasValueNote && $scope.data.notSpecialType;
	};

	$scope.toggleClearValue=function(){
		$scope.data.clearValue=!$scope.data.clearValue;
	};

	$scope.toggleNotAvailable=function(){
		$scope.data.notAvailable=!$scope.data.notAvailable;
	};

	$scope.toggleAvailable=function(){
		$scope.data.available=!$scope.data.available;
	};

	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;

			// check if anything was modified
			var newComments = $scope.data.comments || '';
			var oldComments = $scope.data.previousComments || '';

			if(newComments!=oldComments  || ($scope.data.available==true || $scope.data.notAvailable==true || $scope.data.clearValue==true)){
				var noteId=$scope.valueNoteId;
				if($scope.availableVisible() && $scope.data.available==true){
					noteId=null;
				}
				if($scope.notAvailableVisible() && $scope.data.notAvailable==true){
					noteId=1;
				}

				$modalInstance.close({
					comments:$scope.data.comments,
					valueNoteId:noteId,
					clearValue:($scope.data.clearValue || noteId==1) && $scope.data.notSpecialType
				});
			}else{
				$modalInstance.close();
			}
		}
	};

	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};


	$scope.close = function () {
		$modalInstance.close();
	};


}]);