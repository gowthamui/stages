myApp.controller('ViewFileDialogCtrl', ['$scope', '$modalInstance','DataService','title','filePath','useSigned','useSignature', function ($scope, $modalInstance,DataService,title,filePath,useSigned,useSignature) {
	$scope.title = title;
	$scope.processing = true;
	$scope.filePath='ws/clientData/file/ValueFile/'+filePath;
    $scope.downloadPath='ws/clientData/file/SignedDocument/'+filePath;

    if(useSigned==true){
        $scope.filePath='ws/clientData/file/SignedDocument/'+filePath;
        $scope.downloadPath='ws/clientData/file/SignedDocument/'+filePath;
    }

    if(useSignature==true){
        $scope.filePath='ws/clientData/image/ValueSignature/'+filePath;
        $scope.downloadPath='ws/clientData/image/ValueSignature/'+filePath;
    }

	$scope.close = function (result) {
		$modalInstance.close();
	};

	$scope.isVisible=function(val){
		return {visibility:$scope.processing==val?'visible':'hidden'} ;
	}

	$scope.frameLoaded=function(evt){

		$scope.processing = false;

		if(!$scope.$$phase){
			$scope.$apply();
		}

	}


}]);