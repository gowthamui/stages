myApp.controller('AddParticipantToStudyCtrl', ['$scope','$filter', '$modalInstance','DataService','ObjectStateService','itemToEdit','options', function ($scope,$filter, $modalInstance,DataService,ObjectStateService,itemToEdit,options) {
    $scope.options=options || {};
    $scope.studiesLoading=true;
	$scope.item=itemToEdit || {
		studyDefSummary:{
			id:null
		},
		dateAdded:new Date(),
		participantSummary:{},
		studyEnrollmentStatusSummary:{objectStateTypeSummary:{}}
	};
	if(!$scope.item.studyDefSummary){
		$scope.item.studyDefSummary={};
	}
	if(!$scope.item.participantSummary){
		$scope.item.participantSummary={};
	}
	if(!$scope.item.objectStateTypeSummary){
		$scope.item.objectStateTypeSummary={};
	}


	var tempTitle = $scope.item.id>0?'Edit Enrollment':'Add Participant to Study';
    $scope.loadingHistory=false;
	$scope.dialogVisible=true;
	$scope.title = tempTitle;
    $scope.form={};
	$scope.alerts = [];
	$scope.processing = false;
	$scope.studyDefs =[];
	$scope.studyStatuses = [];
	$scope.requiredFields = function(){
		var fields = [{field:'item.participantStudyId',message:'Participant Study ID is required'}];
		if($scope.selectedStudy()){
			var participantSourceId=$scope.selectedStudy().participantSourceId || 1;
			if(participantSourceId==1){
				fields = [{field:'item.participantSummary.idTag',message:'EMPI is required'},
					{field:'item.participantSummary.firstName',message:'First Name is required'},
					{field:'item.participantSummary.lastName',message:'Last Name is required'}
                ];
			}
		}
		return fields;
	};

    $scope.formatStudyId=function(id){
        var result='';
        angular.forEach($scope.studyDefs,function(item){
            if(id==item.id){
                result=item.name;
            }
        });
        return result;
    }

	$scope.selectedStudy =function(){
		var selStudy=null;
		angular.forEach($scope.studyDefs,function(item){
			if($scope.item.studyDefSummary && item.id==$scope.item.studyDefSummary.id){
				selStudy=item;
			}
		});

		return selStudy;
	}

	$scope.studyUnderConstruction=function(){
		var result=false;
		var study=$scope.selectedStudy();
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

	DataService.post('data/StudyDef/search',{searchContext:'StudyEnrollment',objectStateSummary:{objectStateTypeSummary:{id:9}}}).then(function(result){
		$scope.studyDefs=result.data.items;
        $scope.item.studyDefSummary.id=$scope.options.studyId;
        $scope.studiesLoading=false;
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
	};

	$scope.save = function () {
		$scope.isValid();
		if ($scope.form.$valid && $scope.alerts.length==0) {
			$scope.alerts = [];
			$scope.processing = true;
			$scope.item.dateOfBirth=DataService.truncateDate($scope.item.dateOfBirth);
			$scope.item.isTest=$scope.studyUnderConstruction();
            $scope.item.comments=$scope.item.statusComments;

			DataService.post('data/StudyEnrollment/update',$scope.item).then(
				function (newItem) {
					$scope.processing = false;
					if(newItem.data.item.participantPreviouslyEnrolledMessage){
						$scope.alerts.push({
							msg: newItem.data.item.participantPreviouslyEnrolledMessage.errorMessage,
							type: 'error'}
						);
					}else{
                        newItem.data.statusComments=null;
                        newItem.data.comments=null;
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
    $scope.optionalFieldVisible = function(optionalField) {
    	if ($scope.selectedStudy())
    		if ($scope.selectedStudy().optionalFields)
    			if ($scope.selectedStudy().optionalFields.indexOf(optionalField) >=0)
    				return true;
    	return false;
    };
}]);