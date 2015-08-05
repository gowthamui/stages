myApp.controller('EditStudyFormTaskCtrl', ['$scope', '$modalInstance','UserService','DataService','itemToEdit', function ($scope, $modalInstance,UserService,DataService,itemToEdit) {
    var tempTitle = itemToEdit.id>0? 'Add Task':'Edit Task';
    $scope.title = tempTitle;
    $scope.alerts = [];
    $scope.processing = false;
    $scope.taskStatuses=[];
    $scope.users = [];
    $scope.studyDefId=itemToEdit.studyDefId;

    DataService.post('data/Users/search',{filterByStudyDefId:$scope.studyDefId}).then(function(result){
        $scope.users=result.data.items;

    },function(data, status, headers, config){
        console.log('error %o',arguments);
    });

    DataService.post('data/TaskStatus/search',{}).then(function(result){
        $scope.taskStatuses =result.data.items;

    },function(data, status, headers, config){
        console.log('error %o',arguments);
    });

    if(itemToEdit.id>0){
        $scope.processing=true;
        DataService.post('data/StudyFormTask/view',{id:itemToEdit.id,studyFormId:itemToEdit.studyFormId}).then(function(result){
            $scope.processing=false;
            var temp = result.data.item;
            $scope.item={
                id:temp.id,
                title:temp.title,
                description:temp.description,
                createdByUserId:temp.createdByUserId,
                taskStatusId:temp.taskStatusId,
                studyFormId:temp.studyFormId,
                assignedToUserId:temp.assignedToUserId,
                history:temp.history
            };
        },function(data, status, headers, config){
            console.log('error %o',arguments);
        });
    }else{
        $scope.item={
            assignedToUserId:UserService.userId,
            taskStatusId:1,
            studyFormId:itemToEdit.studyFormId
        };
    }

    $scope.save = function () {
        if ($scope.form.$valid) {
            $scope.alerts = [];
            $scope.processing = true;

            DataService.post('data/StudyFormTask/update',$scope.item).then(
                function (newItem) {
                    $scope.processing = false;
                    $modalInstance.close(newItem.data.item);
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



    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.close = function (result) {
        $modalInstance.close();
    };
}]);