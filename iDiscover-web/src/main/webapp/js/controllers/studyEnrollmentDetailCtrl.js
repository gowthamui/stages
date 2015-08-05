myApp.controller('StudyEnrollmentDetailCtrl', ['$scope','DataService','$stateParams','$state','$window', function ($scope,DataService,$stateParams,$state,$window) {
	console.log($stateParams) ;

	$scope.studyEnrollmentId=$stateParams.studyEnrollmentId;
	$scope.title = 'Loading...';
	$scope.processing=false;
	$scope.selectedItems = [];
	$scope.gridData = [];
	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
		multiSelect: false,
		enableSorting:true,
		showColumnMenu: false,
		selectedItems: $scope.selectedItems,
		columnDefs: [
			{field: 'formDefSummary.name', displayName: 'Form'},
			{field: 'formTypeSummary.name', displayName: 'Form Type'},
			{field: 'objectStateTypeSummary.name', displayName: 'Status'}
		],
		rowTemplate: '<div ng-dblclick="openEdit()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
	};

	$scope.canEdit=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.openEdit=function(){
		var el =$scope.selectedItems[0];
		$state.transitionTo('formDetail',{studyDefFormDefId:el.studyDefFormDefId,participantId:el.participantId});
	};



	$scope.refreshRows=function(){
		$scope.processing=true;
		DataService.post('data/StudyEnrollmentStatusSummary/view',{id:$scope.studyEnrollmentId}).then(function(result){
			console.log('success %o',arguments);
			var summary = result.data.item.studyDefSummary.name;
			var part = result.data.item.studyEnrollmentSummary.participantSummary;
			if(part!=null)
				summary=summary+' - '+part.idTag;

			$scope.title = summary;
			$scope.processing=false;
			$scope.gridData=result.data.item.forms;
			$scope.gridData.sort(function(a,b){
				return a.displaySeq - b.displaySeq;
			});

		},function(data, status, headers, config){
			console.log('error %o',arguments);
		});
	}


	$scope.refreshRows();
}]);