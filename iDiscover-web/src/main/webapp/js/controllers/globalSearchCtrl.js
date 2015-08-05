myApp.controller('GlobalSearchCtrl', ['$scope', '$rootScope', 'DataService', '$stateParams', '$state', '$cookieStore', function ($scope, $rootScope, DataService, $stateParams, $state, $cookieStore) {
	$scope.title = "Search";
	$scope.selectedItems = [];
    $scope.processing=true;

	DataService.post('data/GlobalSearch/search', {
		textToSearch: $rootScope.globalSearch
	}).then(function(result) {
        $scope.processing=false;
		$scope.studyEnrollments = result.data.item.studyEnrollments;
		$scope.studyDefinitions = result.data.item.studyDefinitions;
		$scope.studyDefFormDefinitions = result.data.item.studyDefFormDefinitions;
	});

	$scope.gridStudyEnrollments = {
		data: 'studyEnrollments',
		multiSelect: false,
		selectedItems: $scope.selectedItems,
		columnDefs: [
				{field: 'id', displayName: 'Id',width:60,sortable:true},
				{field: 'studyDefSummary.name', displayName: 'Study'},
				{field: 'participantSummary.idTag', displayName: 'EMPI',width:150},
				{field: 'participantSummary.lastName', displayName: 'Last Name'},
				{field: 'participantSummary.firstName', displayName: 'First Name'},
				{field: 'participantStudyId', displayName: 'Participant Study ID',width:150},
				{field: 'secondaryStudyId', displayName: 'Secondary Study ID',width:150},
				{field: 'studyEnrollmentStatusSummary.objectStateTypeSummary.name', displayName: 'Participant Status',width:175}
			],
			rowTemplate: '<div ng-dblclick="openDetails()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
	};
	$scope.openDetails = function() {
		$state.transitionTo('studyEnrollmentDetail', {
			studyDefId: $scope.selectedItems[0].studyDefSummary.id,
			studyEnrollmentId: $scope.selectedItems[0].id,
			studyDefFormDefId: 0,
			participantId: 0
		});
	};

	$scope.gridStudyDefinitions = {
		data: 'studyDefinitions',
		multiSelect: false,
		selectedItems: $scope.selectedItems,
		columnDefs: [
				{field: 'id', displayName: 'Id' , width: 60},
				{field: 'name', displayName: 'Name'},
				{field: 'organizationSummary.name', displayName: 'Organization'},
				{field: 'objectStateSummary.objectStateTypeSummary.name', displayName: 'Status', width:140},
				{field: 'endDate', displayName: 'End Date',cellFilter:'date', width:130}
			],
			rowTemplate: '<div ng-dblclick="openStudyEnrollments()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
	};
	$scope.openStudyEnrollments = function() {
		if ($scope.selectedItems[0].objectStateSummary.objectStateTypeSummary.name == 'Closed') {
			alert('The study is closed');
		} else {
			$cookieStore.put('studyDefId', $scope.selectedItems[0].id);
			$state.transitionTo('studyEnrollment');
		}
	};

	$scope.gridStudyForms = {
			data: 'studyDefFormDefinitions',
			multiSelect: false,
			selectedItems: $scope.selectedItems,
			columnDefs: [
					{field: 'studyDefId', displayName: 'Id' , width: 60},
					{field: 'studyDefName', displayName: 'Study'},
					{field: 'formDefSummary.name', displayName: 'Form'}
				],
				rowTemplate: '<div ng-dblclick="openFormDefinition()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
	};
	$scope.openFormDefinition = function() {
		$state.transitionTo('studyEnrollmentDetail', {
			studyDefId: $scope.selectedItems[0].studyDefId,
			studyEnrollmentId: 0,
			studyDefFormDefId: $scope.selectedItems[0].id,
			participantId: 0
		});
	};
}]);