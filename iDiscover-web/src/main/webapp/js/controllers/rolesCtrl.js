myApp.controller('RolesCtrl', ['$scope','$rootScope','DataService','$stateParams','$modal', function ($scope,$rootScope,DataService,$stateParams,$modal) {
	$scope.title='Roles';
	$scope.processing=false;
	$scope.selectedItems=[];
	$scope.gridData = [];

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
			{field: 'id', displayName: 'Id', width:50},
			{field: 'name', displayName: 'Name'},
			{field: 'description', displayName: 'Description'}
		],
		rowTemplate: '<div ng-dblclick="openEdit()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>',
		enableSorting: true
	};

	$scope.canEdit=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.openAddEdit=function(itemToEdit){
		var d = $modal.open({
			templateUrl:'../partials/editRole.html',
			controller:'EditRoleCtrl',
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
		DataService.post('data/Role/search',{}).then(function(result){
			var summary = result.data;
			$scope.processing=false;
			$scope.gridData=summary.items;

		},function(data, status, headers, config){
			console.log('error %o',arguments);
		});
	}

	$scope.refreshRows();

}]);