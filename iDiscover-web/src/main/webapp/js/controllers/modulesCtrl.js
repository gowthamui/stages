myApp.controller('ModulesCtrl', ['$scope','$rootScope','DataService','$state','$modal','UserService', function ($scope,$rootScope,DataService,$state,$modal,UserService) {

	$scope.getClosedCaption=function(isClosed){
		return isClosed?'Closed':'Open';
	};
	var closedTemplate= '<div class="ngCellText" ng-class="col.colIndex()" ng-style="getIndent(row.entity)"><span ng-cell-text>{{getClosedCaption(row.getProperty(col.field))}}</span></div>';
	$scope.title='Define Form Templates';
	$scope.processing=false;
	$scope.selectedItems=[];
	$scope.userCanAdd=false;
	$scope.gridData = [];
	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
		multiSelect: false,
		enableSorting:true,
		showColumnMenu: false,
		showFilter:true,
		sortInfo : {fields:['name'],directions:['asc']},
		selectedItems: $scope.selectedItems,
		columnDefs: [
			{field: 'id', displayName: 'Id', width:60},
			{field: 'name', displayName: 'Name'},
			{field: 'organizationSummary_name', displayName: 'Organization'},
			{field: 'isClosed', displayName: 'Closed?',width:100,cellTemplate:closedTemplate}

		],
		rowTemplate: '<div ng-dblclick="openElements()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
	};


	$scope.convertItem=function(item){
		if(item.organizationSummary){
			item.organizationSummary_name=item.organizationSummary.name;
		}
	};

	$scope.showClosed=false;
	$scope.toggleClosed=function(){
		$scope.showClosed=!$scope.showClosed;
		$scope.refreshRows();
	};

	$scope.getShowIcon=function(){
		return $scope.showClosed?'fa fa-check-square-o':'fa fa-square-o';
	};

	$scope.openAddEdit=function(itemToEdit){

		var d = $modal.open({
			templateUrl:'../partials/editFormDef.html',
			controller:'EditFormDefCtrl',
			backdropClick: false,
			resolve: {itemToEdit:function(){return angular.copy(itemToEdit);},itemToCopy:function(){return null;}}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if(result){
				if(!itemToEdit){
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

	$scope.canEdit=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.canOpenForms=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.canAdd=function(){
		return $scope.userCanAdd;
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



	$scope.saveAs=function(){
		var el = null;
		if($scope.selectedItems.length>0){
			el=$scope.selectedItems[0];
		}
		el=angular.copy(el);

		var d = $modal.open({
			templateUrl:'../partials/editFormDef.html',
			controller:'EditFormDefCtrl',
			backdropClick: false,
			resolve: {itemToCopy:function(){return el;},itemToEdit:function(){return null;}}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if(result){
				if(result.item){
					$scope.convertItem(result.item);
					$scope.gridData.push(result.item);
				}
				if (!$scope.$$phase)
					$scope.$apply();
			}
		});
	};


	$scope.highlightRow=function(index){
		setTimeout(function(){
			$scope.gridOptions.selectItem(index,true);
			if (!$scope.$$phase)
				$scope.$apply();

		},10);
	};

	$scope.openElements=function(){
		$state.transitionTo('formDefDetail',{formDefId:$scope.selectedItems[0].id});
	};

	$scope.refreshRows=function(){
		$scope.processing=true;
		DataService.post('data/FormDef/search',{formDefTypeId:1,showClosedItems:$scope.showClosed}).then(function(result){
			console.log('success %o',arguments);
			$scope.userCanAdd=result.data.item.userCanAddNewItem;
			angular.forEach(result.data.items,function(item){
				$scope.convertItem(item);
			});
			$scope.gridData=result.data.items;
			$scope.processing=false;
			if(!$scope.$$phase){
				$scope.$apply();
			}
		},function(data, status, headers, config){
			console.log('error %o',arguments);
		});
	}

	$scope.refreshRows();


}]);