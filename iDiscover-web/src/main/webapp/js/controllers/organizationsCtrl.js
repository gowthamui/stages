myApp.controller('OrganizationsCtrl', ['$scope','$rootScope','DataService','$stateParams','$modal', function ($scope,$rootScope,DataService,$stateParams,$modal) {
	$scope.title='Organizations';
	$scope.selectedItems=[];
	$scope.gridData = [];
	$scope.processing=false;

	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
		enableSorting:true,
		multiSelect: false,
		enableRowReordering:false,
		showFilter:true,
		showColumnMenu: false,
		sortInfo : {fields:['name'],directions:['asc']},
		selectedItems: $scope.selectedItems,
		columnDefs: [
			{field: 'id', displayName: 'Id', width:60},
			{field: 'name', displayName: 'Name'},
			{field: 'abbreviation', displayName: 'Abbreviation'}
		],
		rowTemplate: '<div ng-dblclick="openEdit()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>',
		enableSorting: true
	};

	$scope.canEdit=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.canAdd=function(){
		return true;
	};

	$scope.openAddEdit=function(itemToEdit){
		var d = $modal.open({
			templateUrl:'../partials/editOrganization.html',
			controller:'EditOrganizationCtrl',
			backdropClick: false,
			resolve: {itemToEdit:function(){return itemToEdit;}}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if(result){
				if(itemToEdit==null){
					// push new item
					$scope.gridData.push(result.item);
				}else{
					// sync existing item
					angular.copy(result.item,itemToEdit);
				}
				if (!$scope.$$phase)
					$scope.$apply();
			}
		});
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

	$scope.highlightRow=function(index){
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
		DataService.post('data/Organization/search',{}).then(function(result){
			var summary = result.data;
			$scope.gridData=summary.items;
			$scope.processing=false;

		},function(data, status, headers, config){
			console.log('error %o',arguments);
		});
	}

	$scope.refreshRows();

}]);