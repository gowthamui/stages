myApp.controller('LookupGroupsCtrl', ['$scope','$rootScope','DataService','$stateParams','$modal', function ($scope,$rootScope,DataService,$stateParams,$modal) {

	$scope.getClosedCaption=function(isClosed){
		return isClosed?'Closed':'Open';
	};
	var closedTemplate= '<div class="ngCellText" ng-class="col.colIndex()" ng-style="getIndent(row.entity)"><span ng-cell-text>{{getClosedCaption(row.getProperty(col.field))}}</span></div>';


	$scope.processing=false;
	$scope.title='Lookup Templates';
	$scope.selectedItems=[];
	$scope.gridData = [];

	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
		multiSelect: false,
		enableRowReordering:false,
		enableSorting:true,
		sortInfo : {fields:['name'],directions:['asc']},
		showColumnMenu: false,
		showFilter:true,
		selectedItems: $scope.selectedItems,
		columnDefs: [
			{field: 'id', displayName: 'Id', width:50},
			{field: 'name', displayName: 'Name'},
			{field: 'organizationSummary_name', displayName: 'Organization'},
			{field: 'isClosed', displayName: 'Closed?',width:100,cellTemplate:closedTemplate}
		],
		rowTemplate: '<div ng-dblclick="openEdit()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>',
		enableSorting: true
	};

	$scope.showClosed = false;
	$scope.userCanAdd=false;

	$scope.convertItem=function(item){
		if(item.organizationSummary){
			item.organizationSummary_name=item.organizationSummary.name;
		}
	};

	$scope.toggleClosed=function(){
		$scope.showClosed=!$scope.showClosed;
		$scope.refreshRows();
	};

	$scope.getShowIcon=function(){
		return $scope.showClosed?'fa fa-check-square-o':'fa fa-square-o';
	};

	$scope.canEdit=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.canAdd=function(){
		return $scope.userCanAdd;
	};

	$scope.canDelete=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.openAddEdit=function(itemToEdit){
		var d = $modal.open({
			keyboard:false,
			templateUrl:'../partials/editLookupGroup.html',
			controller:'EditLookupGroupCtrl',
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
				}

				if (!$scope.$$phase)
					$scope.$apply();
				$scope.refreshRows();
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

	$scope.openDelete=function(){
		var el = null;
		var currIndex=0;
		if($scope.selectedItems.length>0){
			el=$scope.selectedItems[0];
			currIndex=$scope.gridData.indexOf(el);
		}
		var d = $modal.open({
			templateUrl: '../partials/deleteDialog.html',
			controller: 'DeleteDialogCtrl',
			backdropClick: false,
			resolve: {options: function() { return {
				title: 'Delete "'+el.name+'"?',
				message: 'Are you sure you want to delete "'+el.name+'"?',
				callback: function(success,failure){
					DataService.post('data/LookupGroup/delete',{id:el.id}).then(function(result){
						success(result.data);
					},failure);
				}
			};}}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if(result){
				var temp = [];
				$scope.gridData.splice(currIndex,1);
				$scope.highlightRow(currIndex);
			}

		});
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
		DataService.post('data/LookupGroup/search',{showOnlyItemsUserCanEdit:true,showClosedItems:$scope.showClosed}).then(function(result){
			var summary = result.data;
			$scope.userCanAdd=result.data.item.userCanAddNewItem;
			angular.forEach(summary.items,function(item){
				$scope.convertItem(item);
			});
			$scope.gridData=summary.items;
			$scope.processing=false;

		},function(data, status, headers, config){
			console.log('error %o',arguments);
		});
	}

	$scope.refreshRows();

}]);