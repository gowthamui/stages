myApp.controller('StudyDefDetailCtrl', ['$scope','$rootScope','DataService','ThemeService','$stateParams','$state','$modal', function ($scope,$rootScope,DataService,ThemeService,$stateParams,$state,$modal) {
	$scope.title='Loading...';
	$scope.selectedItems=[];
	$scope.gridData = [];
	$scope.studyDef = null;
	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
		multiSelect: false,
		showColumnMenu: false,
		selectedItems: $scope.selectedItems,
		enableSorting:false,
		columnDefs: [
			{field: 'formDefSummary.name', displayName: 'Form'},
			{field: 'formTypeSummary.name', displayName: 'Form Type',width:'250'}
		],
		rowTemplate: '<div ng-dblclick="openElements()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
	};

    $scope.theme=ThemeService;

    $scope.canSaveAs=function(){
        return $scope.selectedItems.length>0;
    };

    $scope.saveAs=function(){
        var el = null;
        if($scope.selectedItems.length>0){
            el=$scope.selectedItems[0];
        }
        console.log(el);
        el=angular.copy(el.formDefSummary);

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

                }
                if (!$scope.$$phase)
                    $scope.$apply();
            }
        });
    };

	$scope.orderItems=function(items){
		var results=[];
		angular.forEach(items,function(item){
			results.push(item);
		});
		results.sort(function(a,b){
			return a.displaySeq - b.displaySeq;
		});
		angular.forEach(results,function(item,index){
			item.displaySeq=index;
		});
		return results;
	};

	$scope.updateOrder=function(){
		$scope.studyDef.formDefSummaries = $scope.gridData;
		DataService.post('data/StudyDefFormOrder/update',$scope.studyDef).then(function(result){
			console.log("update successful") ;
		},function(data, status, headers, config){
			console.log('error %o',arguments);
		});
	};

	$scope.canEdit=function(){
		return $scope.selectedItems.length>0;
	};

    $scope.canShare=function(){
        var result=false;
        if($scope.selectedItems.length>0){
            var item=$scope.selectedItems[0];
            result=true;
        }
        return result;
    };

	$scope.canAdd=function(){
		return true;
	};

	$scope.canDelete=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.moveUp=function(){
		if($scope.canMoveUp()){
			var selectedItem = $scope.selectedItems[0];
			var index = $scope.gridData.indexOf($scope.selectedItems[0]);
			var prevItem = $scope.gridData[index-1];
			var oldSeq=selectedItem.displaySeq;
			selectedItem.displaySeq=prevItem.displaySeq;
			prevItem.displaySeq=oldSeq;
			$scope.gridData= $scope.orderItems($scope.gridData);
			$scope.updateOrder();
		}
	};

	$scope.moveDown=function(){
		if($scope.canMoveDown()){
			var selectedItem = $scope.selectedItems[0];
			var index = $scope.gridData.indexOf($scope.selectedItems[0]);
			var nextItem = $scope.gridData[index+1];
			var oldSeq=selectedItem.displaySeq;
			selectedItem.displaySeq=nextItem.displaySeq;
			nextItem.displaySeq=oldSeq;
			$scope.gridData= $scope.orderItems($scope.gridData);
			$scope.updateOrder();
		}
	};

	$scope.canMoveUp=function(){
		var result =false;
		if($scope.selectedItems.length>0){
			var index = $scope.gridData.indexOf($scope.selectedItems[0]);
			result = index>0;
		}
		return result;
	};

	$scope.canMoveDown=function(){
		var result =false;
		if($scope.selectedItems.length>0){
			var index = $scope.gridData.indexOf($scope.selectedItems[0]);
			result = index<$scope.gridData.length-1;
		}
		return result;
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

	$scope.openElements=function(){
		$state.transitionTo('formDefDetail',{formDefId:$scope.selectedItems[0].formDefSummary.id});
	};

	$scope.openAddEdit=function(itemToEdit){
		var d = $modal.open({
			templateUrl:'../partials/editStudyDefFormDef.html',
			controller:'EditStudyDefFormDefCtrl',
			backdropClick: false,
			resolve: {
				itemToEdit: function() {
					return angular.copy(itemToEdit);
				},
				studyDefId: function() {
					return $stateParams.studyDefId;
				},
				forms: function() {
					return $scope.gridData;
				}}
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

    $scope.openShare=function(itemToEdit){
        var itemToEdit = null;
        if($scope.selectedItems.length>0){
            itemToEdit=$scope.selectedItems[0];
        }
        var d = $modal.open({
            templateUrl:'../partials/shareForm.html',
            controller:'ShareFormCtrl',
            backdropClick: false,
            windowClass: 'modalViewContent',
            resolve: {itemToEdit:function(){return angular.copy(itemToEdit);},studyDefId:function(){return $stateParams.studyDefId;}}
        });
        $rootScope.isNavigating=true;
        $rootScope.currDialog=d;
        d.result.then(function (result) {
            $rootScope.isNavigating=false;
            $rootScope.currDialog=null;
            if(result){
            }
        });
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
				title:'Delete "'+el.name+'"?',
				message:'Are you sure you want to delete "'+el.formDefSummary.name+'"?',
				callback:function(success,failure){
					DataService.post('data/StudyDefFormDef/delete',{id:el.id}).then(function(result){
						success(result.data);
					},failure);
				}
			};}}
		});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			if(result){
				$rootScope.isNavigating=false;
				$rootScope.currDialog=null;
				var temp = [];
				$scope.gridData.splice(currIndex,1);
			}
		});
	};


	$scope.refreshRows=function(){
		$scope.processing=true;
		DataService.post('data/StudyDef/view',{id:$stateParams.studyDefId}).then(function(result){
			var summary = result.data.item;
			$scope.studyDef=summary;
			$scope.title = summary.name;
			$scope.gridData=$scope.orderItems(summary.formDefSummaries);
			$scope.processing=false;

		},function(data, status, headers, config){
			console.log('error %o',arguments);
		});
	}

	$scope.refreshRows();

}]);