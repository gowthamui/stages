myApp.controller('SurveyEditSignatureDialogCtrl', ['$scope','$document', '$modalInstance','DataService','comments','title','description','printedName','signatureValueId','signaturePath', function ($scope,$document, $modalInstance,DataService,comments,title,description,printedName,signatureValueId,signaturePath) {
    $scope.title = title;
    $scope.description = description;
    $scope.actionButtonTitle='Save';
    $scope.alerts = [];
    $scope.processing = false;
    $scope.comments=comments;
    $scope.data={
        signatureValueId:signatureValueId,
        printedName:printedName,
        description: description,
        signaturePath:signaturePath
    };


    $scope.save = function () {
        if ($scope.form.$valid) {
            $scope.alerts = [];
            $scope.processing = true;
            var bytes=$scope.data.pad.toDataURL().replace('data:image/png;base64,','');
            $modalInstance.close({
                mimeType:'image/png',
                bytes:bytes,
                printedName:$scope.data.printedName
            });
        }
    };

    $scope.clear=function(){
        if($scope.data.pad){
            $scope.data.pad.clear();
            $scope.data.pad.readOnly=false;
        }
    }

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.close = function (result) {
        $modalInstance.close();
    };


}]);