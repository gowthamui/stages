myApp.controller('ShareFormCtrl', ['$scope', '$modalInstance','DataService','itemToEdit','studyDefId', function ($scope, $modalInstance,DataService,itemToEdit,studyDefId) {
    $scope.item=angular.copy(itemToEdit?itemToEdit:{formTypeSummary:{id:1},formDefSummary:{},studyDefId:studyDefId});


    $scope.loading=true;
    $scope.dialogVisible=true;
    $scope.isNew =  !itemToEdit;
    var tempTitle = 'Send Form to Participants';
    $scope.title = tempTitle;
    $scope.alerts = [];
    $scope.processing = false;
    $scope.selectedEmails=[];
    $scope.emailData={
        recipientType:'study'

    };

    $scope.gridOptions = {
        data: 'emailData.participants',
        displayFooter: false,
        displaySelectionCheckbox: true,
        showSelectionCheckbox:true,
        multiSelect: true,
        enableRowReordering:false,
        showColumnMenu: false,
        showFilter:true,
        enableSorting:true,
        selectedItems: $scope.selectedEmails,
        sortInfo:{fields:['lastName','firstName'],directions:['asc']},
        columnDefs: [
            {field: 'idTag', displayName: 'Id'},
            {field: 'participantStudyId', displayName: 'Participant Study Id'},
            {field: 'firstName', displayName: 'First Name'},
            {field: 'lastName', displayName: 'Last Name'},
            {field: 'email', displayName: 'Email',enableCellEdit:true},
            {field: 'enrollmentStateType', displayName: 'Status'}
        ]

        // ID,
        // ID_TAG,
        // STUDY_STATE_TYPE_ID,
        // STUDY_STATE_TYPE
        // FIRST_NAME,
        // LAST_NAME,
        // PARTICIPANT_STUDY_ID,
        // EMAIL
    };

    $scope.save = function () {
        if ($scope.form.$valid) {
            $scope.alerts = [];
            $scope.processing = true;

            angular.forEach($scope.emailData.participants,function(item){
                if($scope.selectedEmails.indexOf(item)>=0){
                    item.selected=true;
                }else{
                    item.selected=false;
                }
            });

            DataService.post('data/ParticipantSurvey/update',$scope.emailData).then(
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

    $scope.dialogChanged = function(visible){
        $scope.dialogVisible=!visible;
    }

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };


    $scope.close = function (result) {
        $modalInstance.close();
    };

    $scope.highlightRow=function(options,index){
        setTimeout(function(){
            options.selectItem(index,true);
            if (!$scope.$$phase)
                $scope.$apply();

        },10);
    }

    $scope.loadProperties=function(){
        $scope.loading=true;
        DataService.post('data/ParticipantSurvey/view',{studyDefFormDefId:$scope.item.id}).then(function(result){
            $scope.emailData=result.data.item;
            $scope.loading=false;
        },function(data, status, headers, config){
            console.log('error %o',arguments);
        });
    }

    $scope.loadProperties();




}]);