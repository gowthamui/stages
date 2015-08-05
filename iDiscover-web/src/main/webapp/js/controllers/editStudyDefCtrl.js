myApp.controller('EditStudyDefCtrl', ['$scope','$rootScope','$modal', '$modalInstance','$timeout','DataService','ThemeService','itemToEdit', function ($scope,$rootScope,$modal, $modalInstance,$timeout,DataService,ThemeService,itemToEdit) {
	$scope.item=angular.copy(itemToEdit?itemToEdit:{editors:[],coordinators:[]});

	var tempTitle = itemToEdit? 'Edit Study':'Add Study';
	itemToEdit=itemToEdit?itemToEdit:{};
	if(!itemToEdit.objectStateSummary){
		itemToEdit.objectStateSummary={};
	}
	if(!itemToEdit.organizationSummary){
		itemToEdit.organizationSummary={};
	}
	if(!itemToEdit.objectStateSummary.objectStateTypeSummary){
		itemToEdit.objectStateSummary.objectStateTypeSummary={};
	}
	if(!itemToEdit.participantSourceId){
		itemToEdit.participantSourceId=1;//require EMPI
	}
    if(!itemToEdit.enrollmentProjections){
        itemToEdit.enrollmentProjections=[];
    }
    if(!itemToEdit.query){
        itemToEdit.query=[];
    }
    itemToEdit.chartReviewSettings=itemToEdit.chartReviewSettings || {};
    if(angular.toString(itemToEdit.chartReviewSettings)){
        itemToEdit.chartReviewSettings=angular.fromJson(itemToEdit.chartReviewSettings);
    }

    $scope.chartReviewDocuments=[
        {id:76091,caption:'History and Physical Report'},
        {id:521031814,caption:'Allergy'},
        {id:110640,caption:'ED Physician/LIP Report'},
        {id:1450580,caption:'Annual Evaluation'},
        {id:15053766,caption:'Clinical Notes'},
        {id:82705,caption:'Family History'},
        {id:521031995,caption:'Medication History'},
        {id:681,caption:'Discharge Summary'},
        {id:258,caption:'Consultation Report'}

    ];

	$scope.selectedProjection=null;
	$scope.removeProjection = function(projection) {
		$scope.form.$setDirty();
		var index = $scope.item.enrollmentProjections.indexOf(projection);
		$scope.item.enrollmentProjections.splice(index,1);
	}

    $scope.formatUser=function(id){
        var result='';
        angular.forEach($scope.users,function(item){
            if(id==item.id){
                result=item.lastName+", "+item.firstName;
            }
        });
        return result;
    }

	$scope.addProjection = function(){
		var d = new Date();
		var amt=10;

		$scope.form.$setDirty();
        if($scope.item.enrollmentProjections.length>0){
            var proj=$scope.item.enrollmentProjections[$scope.item.enrollmentProjections.length-1];
			var tempDate = proj.projectionDate;
			if(!angular.isDate(tempDate)){
				tempDate = new Date(tempDate.projectionDate);
			}
            tempDate.setMonth(tempDate.getMonth()+1);
            d=tempDate;

			if(angular.isNumber(proj.projectedAmount)){
				amt=proj.projectedAmount+10;
			}
		}

		var ob={
			projectionDate:d,
			projectedAmount:amt,
			studyDefId:$scope.item.id
		};
		$scope.item.enrollmentProjections.push(ob);
		$scope.selectedProjection=ob;
	};

    $scope.executeQuery=function(){
        $scope.executingQuery=true;
        DataService.post('data/StudyDefQuery/query',{studyDefId:$scope.item.id,queryId:$scope.item.queryId}).then(function(result){
            $scope.executingQuery=false;
            if(result.data.hasError==true){
                $scope.alerts.push({msg: result.data.errorMessage || 'Unknown Server Error', type: 'error'});
            } else {
				//show results without call update, because function is executed by ClientDataAccessService.java
                $scope.dialogChanged(true);
                var d = $modal.open({
                	keyboard : false,
                	templateUrl : '../partials/queryResults.html',
                	controller : 'QueryResultsCtrl',
                	windowClass : 'modalViewContent',
                	backdropClick : false,
                	resolve : {queryResult : function() {return result.data.item;}}
                });
                $rootScope.isNavigating = true;
                $rootScope.currDialog = d;
                d.result.then(function(dialogResult) {
                	$rootScope.isNavigating = false;
                	$rootScope.currDialog = null;
                	$scope.dialogChanged(false);
                },function() {
                	$scope.dialogChanged(false);
                });
            }
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });
    };

    $scope.executingQuery=false;
	$scope.accessIcon=ThemeService.accessIcon;
	$scope.item=itemToEdit;
	$scope.title = tempTitle;
	$scope.alerts = [];
	$scope.processing = false;
	$scope.tableName = 'STUDY_DEF';
	$scope.query=itemToEdit.id;
	$scope.organizations=[];
	DataService.post('data/Organization/search',{showOnlyItemsUserCanEdit:true}).then(function(result){
		$scope.organizations=result.data.items;
		if(!$scope.$$phase){
			$scope.$apply();
		}
	});

	$scope.participantSources=[];
	DataService.post('data/ParticipantSource/search',{}).then(function(result){
		$scope.participantSources=result.data.items;
		if(!$scope.$$phase){
			$scope.$apply();
		}
	});

	$scope.users=[];
	DataService.users(function(data){
		$scope.users=data;
        var i=$scope.item.principalInvestigatorId;
        $scope.item.principalInvestigatorId=0;
        $timeout(function(){
            $scope.item.principalInvestigatorId=i;
        },10);

	});

	$scope.studyStatuses=[];
	DataService.post('data/ObjectStateType/search',{tableName:'STUDY_DEF'}).then(function(result){
		$scope.studyStatuses=result.data.items;
		if(!$scope.$$phase){
			$scope.$apply();
		}
	});

	$scope.save = function () {
		if ($scope.form.$valid) {
			$scope.alerts = [];
			$scope.processing = true;

			//remove projections without dates
			var itemsToRemove=[];
			angular.forEach($scope.item.enrollmentProjections,function(proj){
				if(!proj.projectionDate){
					itemsToRemove.push();
				}
			});
			angular.forEach(itemsToRemove,function(proj){
				var index=$scope.item.enrollmentProjections.indexOf(proj);
				$scope.item.enrollmentProjections.splice(index,1);
			});

            var itemToSave = angular.copy($scope.item);
            itemToSave.chartReviewSettings=angular.toJson(itemToSave.chartReviewSettings);
			console.log('bout to save %o:',itemToSave);
			DataService.post('data/StudyDef/update',itemToSave).then(
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

	$scope.dialogChanged = function(visible) {
		$scope.hideDialog=visible;
		if(!$scope.$$phase){
			$scope.$apply();
		}
	}

	$scope.openConfigureAccess=function(){
		$scope.dialogChanged(true);
		var d = $modal.open({
			keyboard:false,
			templateUrl:'../partials/configureAccessDialog.html',
			controller:'ConfigureAccessDialogCtrl',
			backdropClick: false,
			resolve: {query:function(){return $scope.query;},tableName:function(){return $scope.tableName;}}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			$scope.dialogChanged(false);
		},function(){
			$scope.dialogChanged(false);
		});
	};

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

    $scope.validateAmount=function(projection,$event){
        if(!projection.projectedAmount){
            $event.currentTarget.value=null;
        }
    }

    

	// update projection date
	angular.forEach($scope.item.enrollmentProjections,function(tempItem){
		if(!angular.isDate(tempItem.projectionDate)){
			tempItem.projectionDate=new Date(tempItem.projectionDate);
		}
	});
}]);