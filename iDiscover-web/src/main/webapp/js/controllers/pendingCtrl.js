myApp.controller('PendingCtrl', ['$scope','DataService','$stateParams','$state', function ($scope,DataService,$stateParams,$state) {
	$scope.title='Pending Items';
	$scope.processing=false;
	$scope.selectedItems=[];
	$scope.gridData = [];
	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
		multiSelect: false,
		enableRowReordering:false,
		enableSorting:true,
		showColumnMenu: false,
		showFilter:true,
		selectedItems: $scope.selectedItems,
		columnDefs: [
            {field: 'itemType', displayName: 'Type',width:90},
			{field: 'formDefName', displayName: 'Form'},
			{field: 'note', displayName: 'Note'},
			{field: 'studyDef', displayName: 'Study'},
            {field: 'participantStudyId', displayName: 'Participant Study ID'},
            {field: 'firstName', displayName: 'Last Name'},
            {field: 'lastName', displayName: 'First Name'},
			{field: 'status', displayName: 'Status'}
		],
		rowTemplate: '<div ng-dblclick="openView()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>',
		enableSorting: true
	};



	$scope.canView = function(){
		return $scope.selectedItems.length>0;
	};
	
	$scope.openView = function(){
		var el = null;
		if($scope.selectedItems.length>0){
			el=$scope.selectedItems[0];
		}
		$state.transitionTo('studyEnrollmentDetail',{studyDefId:el.studyDefId,studyEnrollmentId:el.studyEnrollmentId,studyDefFormDefId:el.studyDefFormDefId,participantId:el.participantId});
	};

	$scope.highlightRow = function(index){
		setTimeout(function(){
			$scope.gridOptions.selectItem(index,true);
			if (!$scope.$$phase)
				$scope.$apply();

		},10);
	};

	$scope.findItem = function (items,tempItemId) {
		var result = null;
		angular.forEach(items, function (value, key) {
			if (value.id == tempItemId) {
				result = value;
				return false;
			}
		});
		return result;
	};

	$scope.refreshRows=function(){
		$scope.processing=true;
		DataService.post('data/PendingItem/search',{}).then(function(result){
			$scope.processing=false;
			$scope.gridData=result.data.items;


		},function(data, status, headers, config){
			console.log('error %o',arguments);
		});
	}

	$scope.refreshRows();
}]);