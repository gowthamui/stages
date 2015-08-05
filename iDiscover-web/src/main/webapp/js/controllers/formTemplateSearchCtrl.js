myApp.controller('FormTemplateSearchCtrl', ['$scope','DataService','ThemeService','$modalInstance', function ($scope,DataService,ThemeService,$modalInstance) {
	$scope.title='Form Templates';
	$scope.selectedItems=[];
	$scope.gridData = [];
	$scope.processing = true;

	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
		multiSelect: false,
		enableRowReordering:false,
		showColumnMenu: false,
		showFilter:true,
		enableSorting:true,
		sortInfo : {fields:['name'],directions:['asc']},
		selectedItems: $scope.selectedItems,
		columnDefs: [
			{field: 'id', displayName: 'Id', width:60},
			{field: 'name', displayName: 'Name'},
			{field: 'organizationSummary_name', displayName: 'Organization'}

		],
		enableSorting:true,
		rowTemplate: '<div ng-dblclick="select()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
	};

	$scope.canSelect=function(){
		return $scope.selectedItems.length>0;
	}

	$scope.close=function(){
		$modalInstance.close();
	}


	$scope.convertItem=function(item){
		if(item.organizationSummary){
			item.organizationSummary_name=item.organizationSummary.name;
		}
	}

	$scope.select=function(){
		var result =null;
		if($scope.selectedItems.length>0){
			result = $scope.selectedItems[0];
		}
		$modalInstance.close(result);
	}

	$scope.search=function(){
		$scope.processing=true;
		$scope.gridData=[];

		DataService.post('data/FormDef/search',{formDefTypeId:1,showClosedItems:false}).success(function(result){
			angular.forEach(result.items,function(item){
				$scope.convertItem(item);
			});
			$scope.gridData=result.items;
			$scope.processing=false;
			if(!$scope.$$phase){
				$scope.$apply();
			}

		}).error(function(item){
				$scope.processing=false;
				if(!$scope.$$phase){
					$scope.$apply();
				}
			});
	}

	$scope.search();
}]);