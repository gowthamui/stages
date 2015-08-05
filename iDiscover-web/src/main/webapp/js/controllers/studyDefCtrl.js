myApp.controller('StudyDefCtrl', ['$scope','$rootScope','DataService','$state','$modal','UserService','$log','ngGridCsvExportPlugin', function ($scope,$rootScope,DataService,$state,$modal,UserService,$log,ngGridCsvExportPlugin) {
	$scope.selectedItems=[];
	$scope.gridData = [];
	$scope.processing=false;
	$scope.title='Define Studies';
	$scope.showClosedStudies = false;
	$scope.userCanAdd=false;

	$scope.toggleShowClosedStudies=function(){
		$scope.showClosedStudies=!$scope.showClosedStudies;
		$scope.refreshRows();
	};

	$scope.getShowIcon=function(){
		return $scope.showClosedStudies?'fa fa-check-square-o':'fa fa-square-o';
	};

	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
        sortInfo : {fields:['name'],directions:['asc']},
		multiSelect: false,
		showColumnMenu: false,
		showFilter:true,
		enableSorting:true,
        plugins: [new ngGridCsvExportPlugin.csvPlugin(null,$scope)],
		selectedItems: $scope.selectedItems,
		columnDefs: [
			{field: 'id', displayName: 'Id' , width: 60},
			{field: 'name', displayName: 'Name'},
			{field: 'organizationSummary_name', displayName: 'Organization'},
			{field: 'objectStateSummary_objectStateTypeSummary_name', displayName: 'Status', width:140},
			{field: 'endDate', displayName: 'End Date',cellFilter:'date', width:130}

		],
		rowTemplate: '<div ng-dblclick="openForms()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
	};

	$scope.convertItem=function(item){
		if(item.organizationSummary){
			item.organizationSummary_name=item.organizationSummary.name;
		}
		if(item.objectStateSummary && item.objectStateSummary.objectStateTypeSummary){
			item.objectStateSummary_objectStateTypeSummary_name=item.objectStateSummary.objectStateTypeSummary.name;
		}
	};

	$scope.openAddEdit=function(itemToEdit){
		var d = $modal.open({
			templateUrl:'../partials/editStudyDef.html',
			controller:'EditStudyDefCtrl',
			backdropClick: false,
			resolve: {itemToEdit:function(){return angular.copy(itemToEdit);}}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if(result){
				if(itemToEdit==null){
					// push new item
					$scope.convertItem(result.item);
					$scope.gridData.push(result.item);
				}else{
					// sync existing item
					angular.copy(result.item,itemToEdit);
					$scope.refreshRows();
				}
				if (!$scope.$$phase)
					$scope.$apply();
			}
		});
	};

	$scope.canEdit=function(){
		var result =false;
		if($scope.selectedItems.length>0){
			return $scope.selectedItems[0].userCanEdit ==true;
		}
		return result;
	};

	$scope.canOpenForms=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.canAdd=function(){
		return true;
	};

	$scope.openAdd=function(){
		$scope.openAddEdit();
	};

	$scope.openEdit=function(){
		var el = null;
		if($scope.selectedItems.length>0){
			el=$scope.selectedItems[0];
		}
		$scope.openAddEdit(el);
	};

	$scope.openForms=function(){
		$state.transitionTo('studyDefDetail',{studyDefId:$scope.selectedItems[0].id});
	};

	$scope.highlightRow=function(index){
		setTimeout(function(){
			$scope.gridOptions.selectItem(index,true);
			if (!$scope.$$phase)
				$scope.$apply();

		},10);
	};

	$scope.refreshRows=function(){
		$scope.processing=true;
		DataService.post('data/StudyDef/search',{searchContext:'DefineStudies',showOnlyItemsUserCanEdit:true,searchByEditorId:UserService.userId,showClosedItems:$scope.showClosedStudies}).then(function(result){
			angular.forEach(result.data.items,function(item){
				$scope.convertItem(item);
			});
			$scope.gridData=result.data.items;
			$scope.userCanAdd=result.data.item.userCanAddNewItem;
			$scope.processing=false;
			if(!$scope.$$phase){
				$scope.$apply();
			}

		},function(data, status, headers, config){
			console.log('error %o',arguments);
			$scope.title='Error';
		});
	}

	$scope.refreshRows();

}]);