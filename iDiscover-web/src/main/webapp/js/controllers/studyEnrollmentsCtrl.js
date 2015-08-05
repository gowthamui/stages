myApp.controller('StudyEnrollmentsCtrl', ['$scope','$rootScope','DataService','$stateParams','$modal','$state','ObjectStateService','ThemeService', '$cookieStore','ngGridCsvExportPlugin', function ($scope,$rootScope,DataService,$stateParams,$modal,$state,ObjectStateService,ThemeService, $cookieStore,ngGridCsvExportPlugin) {
	$scope.title = "Study Enrollment";
	$scope.processing=false;
	$scope.selectedItems=[];
	$scope.gridData = [];
    $scope.studyDefs = [];
	$scope.studyDefId = $cookieStore.get('studyDefId');
	$scope.objectStateTypeId = 11;
    $scope.objectStates=[];
    $scope.filterIcon=ThemeService.filterIcon;

	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
		multiSelect: false,
		enableRowReordering:false,
		showColumnMenu: false,
		enableSorting:true,
		showFilter:false,
        plugins: [new ngGridCsvExportPlugin.csvPlugin(null,$scope)],
		selectedItems: $scope.selectedItems,
		columnDefs: [
			{field: 'id', displayName: 'Id',width:60,sortable:true},
			{field: 'studyDefSummary_name', displayName: 'Study'},
			{field: 'participantSummary_idTag', displayName: 'EMPI',width:150},
			{field: 'participantSummary_lastName', displayName: 'Last Name'},
			{field: 'participantSummary_firstName', displayName: 'First Name'},
            {field: 'participantSummary_email', displayName: 'Email'},
            {field: 'participantSummary_ldapId', displayName: 'LDAP'},
			{field: 'participantStudyId', displayName: 'Participant Study ID', width: 150},
			{field: 'secondaryStudyId', displayName: 'Secondary Study ID', width: 150},
			{field: 'encounterNumber', displayName: 'Encounter Number', width: 150},
			{field: 'facilityId', displayName: 'Facility ID', width: 150},
			{field: 'screeningId', displayName: 'Screening ID', width: 150},
			{field: 'studyEnrollmentStatusSummary_objectStateTypeSummary_name', displayName: 'Participant Status',width:175}

		],
		rowTemplate: '<div ng-dblclick="openDetails()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
	};

    ObjectStateService.getEnrollmentStates(function(results){
        var items = [{id:-1,name:'All Statuses'}];
        angular.forEach(results,function(item){
            items.push(item);
        });
        $scope.objectStates=items;;
        if(!$scope.$$phase){
            $scope.$apply();
        }
    });

	$scope.canOpenDetails=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.canAddParticipant=function(){
		return true;
	};

    $scope.refreshStudyDefs = function(){
        DataService.post('data/StudyDef/search',{searchContext:'StudyEnrollment'}).then(function(result){
            $scope.studyDefs=result.data.items;

            var found=false;
            angular.forEach($scope.studyDefs, function(item){

                if($scope.studyDefId==item.id){
                    found=true;
                }
            });
            if(!found){
                $scope.studyDefId=null;
            }

            if($scope.studyDefs.length>0 && !$scope.studyDefId){
                $scope.studyDefId=$scope.studyDefs[0].id;
            }

            if(!$scope.$$phase){
                $scope.$apply();
            }
        });
    };

	$scope.addParticipant = function() {
		var d = $modal.open({
			templateUrl:'../partials/addParticipantToStudy.html',
			controller:'AddParticipantToStudyCtrl',
			backdropClick: false,
            windowClass: 'modalViewContent',
			resolve: {
				itemToEdit: function() {
					return null;
				},
                options:function(){return {studyId:$scope.studyDefId}}
			}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if(result){
				$scope.convertItem(result.item);
				$scope.gridData.push(result.item);

				if (!$scope.$$phase)
					$scope.$apply();
			}
		});
	};

	function optionalFieldVisible(optionalFields, field) {
		if (optionalFields)
			if (optionalFields.indexOf(field) >=0)
				return true;

		return false;
	};

    $scope.selectedStudy=function(){
        var result=null;
        angular.forEach($scope.studyDefs,function(item){
            if(item.id==$scope.studyDefId){
                result=item.name;
                $scope.gridOptions.$gridScope.columns[5].visible = optionalFieldVisible(item.optionalFields, 'email');
                $scope.gridOptions.$gridScope.columns[6].visible = optionalFieldVisible(item.optionalFields, 'ldapId');
                $scope.gridOptions.$gridScope.columns[9].visible = optionalFieldVisible(item.optionalFields, 'encounterNumber');
                $scope.gridOptions.$gridScope.columns[10].visible = optionalFieldVisible(item.optionalFields, 'facilityId');
                $scope.gridOptions.$gridScope.columns[11].visible = optionalFieldVisible(item.optionalFields, 'screeningId');
            }
        });
        return result;
    };

	$scope.selectStudy = function(item) {
		$scope.studyDefId = item.id;
		$cookieStore.put('studyDefId', item.id);
	};

	$scope.selectState = function(item) {
		$scope.objectStateTypeId=item.id;
	};

    $scope.selectedState=function(){
        var result=null;
        angular.forEach($scope.objectStates,function(item){
            if(item.id==$scope.objectStateTypeId){
                result=item.name;
            }
        });
        return result;
    };

	$scope.openDetails=function(){
        var participantId = 0;
        if($scope.selectedItems[0].participantSummary){
            participantId=$scope.selectedItems[0].participantSummary.id;
        }
        var studyDefFormDefId=0;
		$state.transitionTo('studyEnrollmentDetail',{studyDefId:$scope.selectedItems[0].studyDefSummary.id,studyEnrollmentId:$scope.selectedItems[0].id,studyDefFormDefId:0,participantId:participantId});
	};


	$scope.openEnrollmentProperties=function(){
		var enrollmentToEdit=  $scope.selectedItems[0];
		var d = $modal.open({
			templateUrl:'../partials/editParticipantEnrollment.html',
			controller:'EditParticipantEnrollmentCtrl',
			backdropClick: false,
			resolve: {itemToEdit:function(){return enrollmentToEdit;}}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if(result){

				if(enrollmentToEdit!=null){
					// sync existing participant
					angular.copy(result.item,enrollmentToEdit);
					$scope.convertItem(enrollmentToEdit);
				}
				if (!$scope.$$phase)
					$scope.$apply();
			}
		});
	};
	$scope.convertItem=function(item){
		if(item.studyDefSummary)
			item.studyDefSummary_name=item.studyDefSummary.name;
		if(item.participantSummary){
			item.participantSummary_idTag=item.participantSummary.idTag;
			item.participantSummary_lastName=item.participantSummary.lastName;
			item.participantSummary_firstName=item.participantSummary.firstName;
            item.participantSummary_email=item.participantSummary.email;
            item.participantSummary_ldapId=item.participantSummary.ldapId;
		}
		if(item.studyEnrollmentStatusSummary && item.studyEnrollmentStatusSummary.objectStateTypeSummary){
			item.studyEnrollmentStatusSummary_objectStateTypeSummary_name=item.studyEnrollmentStatusSummary.objectStateTypeSummary.name;
		}
	};

	$scope.refreshRows=function(){
		$scope.processing=true;
		DataService.post('data/StudyEnrollment/search',{
            studyDefSummary:{
                id:$scope.studyDefId
            },
            studyEnrollmentStatusSummary:{
                objectStateTypeSummary:{
                    id:$scope.objectStateTypeId
                }
            },
            objectStateSummary:{
                objectStateTypeSummary:{
                    id:9
                }
            }
        }).then(function(result){
			var summary = result.data;
			$scope.processing=false;
			angular.forEach(summary.items,function(item){
				$scope.convertItem(item);
			});
			$scope.gridData=summary.items;

		},function(data, status, headers, config){
			console.log('error %o',arguments);
		});
	};

    $scope.refreshStudyDefs();

    $scope.$watch('studyDefId',function(newValue,oldValue){
        if(newValue){
            $scope.refreshRows();
        }
    });
    $scope.$watch('objectStateTypeId',function(newValue,oldValue){
        if(newValue){
            $scope.refreshRows();
        }
    });
}]);