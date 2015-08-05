myApp.controller('EditQueryCtrl', ['$rootScope','$scope','$modal', '$modalInstance','DataService','itemToEdit', function ($rootScope,$scope,$modal, $modalInstance,DataService,itemToEdit) {
    $scope.item=angular.copy(itemToEdit?itemToEdit:{});

    var tempTitle = itemToEdit? 'Edit Query':'Add Query';
    $scope.title = tempTitle;
    $scope.alerts = [];
    $scope.processing = false;
    $scope.dialogVisible=true;
    $scope.queryTypes=[];
    $scope.queryCategories=[];
    $scope.form={};
    $scope.executingTestQuery=false;

    $scope.save = function () {
        if ($scope.form.$valid) {
            $scope.alerts = [];
            $scope.processing = true;

            DataService.post('data/Query/update',$scope.item).then(
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

    $scope.testQuery=function(){
        $scope.executingTestQuery=true;
        DataService.post('data/StudyDefQuery/testQuery',{screeningQuery:$scope.item.value}).then(function(result){
            $scope.executingTestQuery=false;
            if(result.data.hasError==true){
                $scope.alerts.push({msg: result.data.errorMessage || 'Unknown Server Error', type: 'error'});
            }else{
                //show results
                $scope.dialogChanged(true);
                var d = $modal.open({
                    keyboard:false,
                    templateUrl:'../partials/queryResults.html',
                    controller:'QueryResultsCtrl',
                    windowClass: 'modalViewContent',
                    backdropClick: false,
                    resolve: {queryResult:function(){return result.data.item;}}
                });
                $rootScope.isNavigating=true;
                $rootScope.currDialog=d;
                d.result.then(function (dialogResult) {
                    $rootScope.isNavigating=false;
                    $rootScope.currDialog=null;
                    $scope.dialogChanged(false);
                },function(){
                    $scope.dialogChanged(false);
                });
            }

            if(!$scope.$$phase){
                $scope.$apply();
            }
        });
    }

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.close = function (result) {
        $modalInstance.close();
    };

    $scope.dialogChanged = function(visible){
        $scope.dialogVisible=!visible;
    }

    DataService.post('data/QueryType/search').then(function(result){
        $scope.queryTypes=result.data.items;
        if(!$scope.$$phase){
            $scope.$apply();
        }
    });

    DataService.post('data/QueryCategory/search').then(function(result){
        $scope.queryCategories=result.data.items;
        if(!$scope.$$phase){
            $scope.$apply();
        }
    });

}]);