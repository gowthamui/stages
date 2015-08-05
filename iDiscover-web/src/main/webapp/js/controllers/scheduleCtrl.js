myApp.controller('ScheduleCtrl', ['$scope','$rootScope','DataService','$stateParams','$state','$cookieStore', function ($scope,$rootScope,DataService,$stateParams,$state,$cookieStore) {
	$scope.title='Schedule';
	$scope.processing=false;
	$scope.selectedItems=[];
	$scope.gridData = [];
	$scope.studyDefs = [];
	$scope.studyDefId = $cookieStore.get('studyDefId');

	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
		multiSelect: false,
		enableRowReordering:false,
		showColumnMenu: false,
		showFilter:true,
		enableSorting:true,
		selectedItems: $scope.selectedItems,
		columnDefs: [
			{field: 'visitName', displayName: 'Visit'},
			{field: 'participantStudyId', displayName: 'Study Id'},
			{field: 'firstName', displayName: 'First Name'},
			{field: 'lastName', displayName: 'Last Name'},
			{field: 'refDate', displayName: 'Visit Date',cellFilter:'date'},
			{field: 'windowBefore', displayName: 'Window Before (days)'},
			{field: 'windowAfter', displayName: 'Window After (days)'}
		],
		rowTemplate: '<div ng-dblclick="openEdit()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>',
		enableSorting: true
	};

	$scope.openEdit=function() {
		var el =$scope.selectedItems[0];
		$state.transitionTo('studyEnrollmentDetail',{studyDefId:el.studyDefId,studyEnrollmentId:el.studyEnrollmentId,studyDefFormDefId:el.studyDefFormDefId,participantId:el.participantId});
	}

	$scope.highlightRow=function(index){
		setTimeout(function(){
			$scope.gridOptions.selectItem(index,true);
			if (!$scope.$$phase)
				$scope.$apply();

		},10);
	};

	$scope.refreshStudyDefs = function(){
		DataService.post('data/StudyDef/search',{searchContext:'StudyEnrollment',objectStateSummary:{objectStateTypeSummary:{id:9}}}).then(function(result){
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

	$scope.refreshRows=function(){
		$scope.processing=true;
		DataService.post('data/StudySchedule/search',{studyDefId:$scope.studyDefId}).then(function(result){
			var summary = result.data;
			$scope.processing=false;
			angular.forEach(summary.items,function(item){
				if(item.secondsBeforeRef){
					item.windowBefore=item.secondsBeforeRef/(24*60*60);
				}
				if(item.secondsAfterRef){
					item.windowAfter=item.secondsAfterRef/(24*60*60);
				}
			});
			$scope.gridData=summary.items;

		},function(data, status, headers, config){
			console.log('error %o',arguments);
		});
	}

	$scope.refreshStudyDefs();

	$scope.$watch('studyDefId',function(newValue,oldValue){
		if(newValue){
			$scope.refreshRows();
		}
	});

	$scope.selectedStudy = function() {
		var result = null;
		angular.forEach($scope.studyDefs, function(item) {
			if(item.id==$scope.studyDefId) {
				result = item.name;
			}
		});
		return result;
	};

	$scope.selectStudy = function(item) {
		$scope.studyDefId = item.id;
		$cookieStore.put('studyDefId', item.id);
	};
}]);