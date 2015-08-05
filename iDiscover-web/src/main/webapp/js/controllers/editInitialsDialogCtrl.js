myApp.controller('EditInitialsDialogCtrl', ['$scope','$document', '$modalInstance','DataService','title','description','valueId', function ($scope, $document, $modalInstance, DataService, title, description, valueId) {
    $scope.title = title;
    $scope.description = description;
    $scope.form={};
    $scope.actionButtonTitle='Save';
    $scope.alerts = [];
    $scope.processing = false;

    $scope.save = function () {
        if ($scope.form.$valid) {
            $scope.alerts = [];
            $scope.processing = true;
            var bytes=$scope.initialDelegate.pad.toDataURL().replace('data:image/png;base64,','');
            $modalInstance.close({
                mimeType:'image/png',
                bytes:bytes
            });
        }
    };

    $scope.clear=function(){
        if($scope.initialDelegate.pad){
            $scope.initialDelegate.pad.clear();
            $scope.initialDelegate.pad.readOnly=false;
        }
    };

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.close = function (result) {
        $modalInstance.close();
    };

    $scope.initialDelegate = {
    	valueId: valueId
    };
}]);