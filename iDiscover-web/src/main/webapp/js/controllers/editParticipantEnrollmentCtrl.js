myApp.controller('EditParticipantEnrollmentCtrl', ['$scope','$filter', '$modalInstance','UserService','DataService','ObjectStateService','itemToEdit', function ($scope,$filter, $modalInstance,UserService,DataService,ObjectStateService,itemToEdit) {
    $scope.item=itemToEdit || {
        studyDefSummary:{
            id:null
        },
        dateAdded:new Date(),
        participantSummary:{},
        studyEnrollmentStatusSummary:{objectStateTypeSummary:{}}
    };

    $scope.originalStatus = $scope.item.studyEnrollmentStatusSummary.objectStateTypeSummary.id;
    if(!$scope.item.studyDefSummary){
        $scope.item.studyDefSummary={};
    }
    if(!$scope.item.participantSummary){
        $scope.item.participantSummary={};
    }
    if(!$scope.item.objectStateTypeSummary){
        $scope.item.objectStateTypeSummary={};
    }

    var tempTitle = 'Edit Enrollment';
    $scope.dialogVisible=true;
    $scope.title = tempTitle;
    $scope.alerts = [];
    $scope.logs=[];
    $scope.processingLogs=false;
    $scope.form={};
    $scope.processing = false;
    $scope.studyStatuses = [];
    $scope.processingHistory=false;
    $scope.history=[];
    $scope.loadingHistory=false;
    $scope.studyHistory=[];


    $scope.requiredFields = function(){
        var fields = [{field:'item.participantStudyId',message:'Participant Study ID is required'}];
        if($scope.item.studyDefSummary){
            var participantSourceId=$scope.item.studyDefSummary.participantSourceId || 1;
            if(participantSourceId==1){
                fields = [{field:'item.participantSummary.idTag',message:'EMPI is required'},
                    {field:'item.participantSummary.firstName',message:'First Name is required'},
                    {field:'item.participantSummary.lastName',message:'Last Name is required'}
                ];
            }
        }
        return fields;
    };

    $scope.statusChanged=function(){
        return $scope.originalStatus!= $scope.item.studyEnrollmentStatusSummary.objectStateTypeSummary.id;
    }



    $scope.studyUnderConstruction=function(){
        var result=false;
        var study=$scope.item.studyDefSummary;
        if(study!=null){
            if(study.objectStateSummary){
                if(study.objectStateSummary.objectStateTypeSummary){
                    result=study.objectStateSummary.objectStateTypeSummary.id==8;
                }
            }

        }

        return result;
    }


    $scope.getStudyHistory = function () {
        if($scope.item.participantSummary && $scope.item.participantSummary.idTag){
            $scope.loadingHistory=true;
            var p = $scope.item.participantSummary;
            DataService.post('data/StudyHistory/view', {empi: p.idTag,participantId: p.id}).then(function (result) {
                $scope.studyHistory = result.data.items;
                $scope.loadingHistory=false;
            }, function (data, status, headers, config) {
                console.log('error %o', arguments);
                $scope.loadingHistory=false;
            });
        }
    };

    $scope.isRequired=function(field){
        var result=false;
        angular.forEach($scope.requiredFields(),function(item){
            if(item.field==field){
                result=true;
            }
        });
        return result;
    };


    ObjectStateService.getEnrollmentStates(function(results){
        $scope.studyStatuses=results;
        if(!$scope.$$phase){
            $scope.$apply();
        }
    });


    $scope.isValid = function(){
        $scope.alerts = [];
        var result = '';
        angular.forEach($scope.requiredFields(),function(item){
            var path = item.field.split('.');
            var ctx=$scope;
            for(i=0;i<path.length; i++){
                ctx=ctx[path[i]];
                if(!ctx || ctx=='Invalid Date'){
                    result+=item.message+'  \n';
                    break;
                }
            }
        });
        if(result.length>0)
            $scope.alerts.push({msg: result, type: 'error'});
    }

    $scope.save = function () {
        $scope.isValid();
        if ($scope.form.$valid && $scope.alerts.length==0) {
            $scope.alerts = [];
            $scope.processing = true;
            $scope.item.dateOfBirth=DataService.truncateDate($scope.item.dateOfBirth);
            $scope.item.isTest=$scope.studyUnderConstruction();

            DataService.post('data/StudyEnrollment/update',$scope.item).then(
                function (newItem) {
                    $scope.processing = false;
                    if(newItem.data.item.participantPreviouslyEnrolledMessage){
                        $scope.alerts.push({
                                msg: newItem.data.item.participantPreviouslyEnrolledMessage.errorMessage,
                                type: 'error'}
                        );
                    }else{
                        newItem.data.item.comments=null;
                        $modalInstance.close(newItem.data);
                        if (!$scope.$$phase)
                            $scope.$apply();
                    }
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

    $scope.refreshLogs=function(){
        $scope.processingLogs=true;
        DataService.post('data/StudyEnrollmentLog/search',{
            studyEnrollmentId:$scope.item.id
        }).then(function(result){
                var summary = result.data;
                $scope.processingLogs=false;
                $scope.logs=summary.items;

            },function(data, status, headers, config){
                console.log('error %o',arguments);
            });
    };

    $scope.refreshHistory=function(){
        $scope.processingHistory=true;
        DataService.post('data/ObjectState/search',{tableName:'STUDY_ENROLLMENT',rowId:$scope.item.id}).then(function(result){
            $scope.processingHistory=false;
            $scope.history=result.data.items;
        },function(data, status, headers, config){
            console.log('error %o',arguments);
        });
    };

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };


    $scope.close = function (result) {
        $modalInstance.close();
    };

    $scope.dialogChanged = function(visible){
        $scope.dialogVisible=!visible;
    };

    $scope.$watch('item.participantSummary.idTag',function(newValue,oldValue){
        $scope.getStudyHistory();
    });

    $scope.refreshLogs();
    $scope.refreshHistory();

    $scope.optionalFieldVisible = function(optionalField) {
		if ($scope.item.studyDefSummary.optionalFields)
			if ($scope.item.studyDefSummary.optionalFields.indexOf(optionalField) >=0)
				return true;
    	return false;
    };
}]);