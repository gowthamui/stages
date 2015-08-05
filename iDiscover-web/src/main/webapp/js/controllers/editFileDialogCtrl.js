myApp.controller('EditFileDialogCtrl', ['$scope', '$modalInstance','DataService','valueSummary','valueDefSummary', function ($scope, $modalInstance,DataService,valueSummary,valueDefSummary) {
	$scope.title = valueDefSummary.name;

	var fileValue=valueSummary.fileValue || {};

    $scope.data={
        hasExisting:true,
        fileType:'existing',
        name:fileValue.name,
        mimeType:null,
        filePath:null,
        bytes:null
    }
	$scope.selectedFile={};
	$scope.form={};
	$scope.selectedFileChangedDelegate=function(){

		if($scope.selectedFile.fileRef)
			$scope.data.name= $scope.selectedFile.fileRef.name;

		$scope.processing=true;
		var reader = new FileReader();
		reader.onload = function(e) {
			$scope.data.mimeType = e.target.result.substr(5, e.target.result.indexOf(';')-5) ;
			$scope.data.bytes = e.target.result.substr(e.target.result.indexOf('base64,')+7);
            $scope.data.dataUrl= e.target.result;
			$scope.processing=false;
			if(!$scope.$$phase){
				$scope.$apply();
			}
		};
		reader.onerror = function(theFile) {
			console.log('Error');
			$scope.processing=false;
		};
		reader.readAsDataURL($scope.selectedFile.fileRef);

		if(!$scope.$$phase){
			$scope.$apply();
		}
	}



	if(!fileValue.id){
		$scope.data.fileType='upload';
		$scope.data.hasExisting=false;
	}
	$scope.data.filePath=fileValue.filePath;

	$scope.showUploadField=function(){
		return $scope.data.hasBytes!='false';
	}

	$scope.processing = false;
	$scope.alerts=[];

	$scope.close = function () {
		$modalInstance.close();
	};

	$scope.save = function () {
		if($scope.data.fileType=='upload' && $scope.selectedFile){
			$modalInstance.close({
				hasBytes:$scope.data.fileType=='upload',
				name:$scope.data.name,
				mimeType:$scope.data.mimeType,
				bytes:$scope.data.bytes,
				filePath:$scope.data.filePath,
				useExisting:$scope.data.fileType=='existing',
                dataUrl:$scope.data.dataUrl
			});
		}else if($scope.data.fileType=='reference'){
			$modalInstance.close({
				hasBytes:false,
				name:$scope.data.name,
				filePath:$scope.data.filePath,
				useExisting:$scope.data.fileType=='existing'
			});
		}else{
			$modalInstance.close({
				name:$scope.data.name,
				useExisting:$scope.data.fileType=='existing'
			});
		}
	};

}]);