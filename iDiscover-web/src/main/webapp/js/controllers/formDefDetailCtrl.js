myApp.controller('FormDefDetailCtrl', ['$scope','$rootScope','DataService','$stateParams','$modal','$state','ThemeService', function ($scope,$rootScope,DataService,$stateParams,$modal,$state,ThemeService) {
	$scope.title='Loading...';
	$scope.selectedItems=[];
	$scope.gridData = [];
	$scope.processing=false;

	$scope.getIndent = function (item) {
		var str = item.hierarchy || '';
		var items = str.split('.');
		items.pop();
		return {
			"margin-left": items.length * ThemeService.indentPixels + 'px'
		};
	};

	$scope.getIcon=function(item){
		return ThemeService.getElementIcon(item);
	};
    $scope.theme=ThemeService;

	var nameTemplate= '<div class="ngCellText" ng-class="col.colIndex()" ng-style="getIndent(row.entity)"><i ng-class="getIcon(row.entity)"></i>&nbsp;<span ng-cell-text>{{row.getProperty(col.field)}}</span></div>';

	var orderItems = function(items,parentId,parentHierarchy){
		var kids = [];
		var result =[];
		angular.forEach(items,function(value,key){
			if((!parentId && !value.elementSummary.parentElementId) || (value.elementSummary.parentElementId==parentId)){
				kids.push(value);
			}
		});
		kids.sort(function(a,b){
			return a.displaySeq - b.displaySeq;
		});
		angular.forEach(kids,function(value,key){
			result.push(value);
			if(parentId){
				value.hierarchy=parentHierarchy?parentHierarchy:'';
				value.hierarchy+='.'+parentId;
			}
			var myKids = orderItems(items,value.elementSummary.id,value.hierarchy);
			angular.forEach(myKids,function(kidVal){
				result.push(kidVal);
			});
		});
		return result;
	};

    $scope.canSaveAs=function(){
        return $scope.formDefDetailSummary!=null;
    };

    $scope.saveAs=function(){

        var el=angular.copy($scope.formDefDetailSummary);

        var d = $modal.open({
            templateUrl:'../partials/editFormDef.html',
            controller:'EditFormDefCtrl',
            modalFade: false,
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

	$scope.getWidgetType=function(item){
		try{
			if(item.elementSummary.elementTypeId==2){
				return item.elementSummary.valueDefSummary.defaultWidgetTypeSummary.name;
			}else if(item.elementSummary.elementTypeId==1){
				return 'Section';
			}else if(item.elementSummary.elementTypeId==3){
				return 'Sub Page';
			}
		}catch(x){
			return '';
		}
	};

	$scope.getSubFormName=function(item){
		var result = '';
		try{
			if(item.elementSummary.elementTypeId==2){

				if(item.elementSummary.valueDefSummary.defaultWidgetTypeSummary.id==5){
					result = item.elementSummary.valueDefSummary.defaultWidgetTypeSummary.name+' (Sub Form Properties)';
				}else{
					result = '('+item.elementSummary.valueDefSummary.defaultWidgetTypeSummary.name+' Properties)';
				}
			}else if(item.elementSummary.elementTypeId==1){
				result= 'Section';
			}else if(item.elementSummary.elementTypeId==3){
				result= 'Sub Page';
			}
		}catch(x){

		}
		return result;
	};

	$scope.goBack=function(){
		window.history.back();
	};

	$scope.canGoBack=function(){
		window.history.length>0;
	};

	$scope.gotoSubForm=function(item){
		$state.transitionTo('formDefDetail',{formDefId:item.elementSummary.valueDefSummary.formDefId});
	};

	$scope.isSubForm=function(item){
		var result=false;
		if(item.elementSummary.elementTypeId==2){
			if(item.elementSummary.valueDefSummary.defaultWidgetTypeSummary.id==16){
				result =true;
			}else if(item.elementSummary.valueDefSummary.defaultWidgetTypeSummary.id==5 && item.elementSummary.valueDefSummary.defaultListWidgetTypeId==16){
				result=true;
			}
		}
		return result;
	};
    var condTemplate= '<div class="ngCellText" ng-class="col.colIndex()"><span  class="expression" ng-cell-text>{{getCondition(row.entity)}}</span></div>';
    var calcTemplate= '<div class="ngCellText" ng-class="col.colIndex()"><span  class="expression" ng-cell-text>{{getCalculation(row.entity)}}</span></div>';
    var autoTemplate= '<div class="ngCellText" ng-class="col.colIndex()"><span  class="expression" ng-cell-text>{{getAuto(row.entity)}}</span></div>';
	var widgetTypeTemplate= '<div class="ngCellText" ng-class="col.colIndex()"><span ng-show="!isSubForm(row.entity)" ng-cell-text>{{getWidgetType(row.entity)}}</span> <a ng-show="isSubForm(row.entity)" ng-click="editSubForm(row.entity)">{{getSubFormName(row.entity)}}</a></div>';
	$scope.gridOptions = {
		data: 'gridData',
		displayFooter: false,
		displaySelectionCheckbox: false,
		multiSelect: false,
        enableColumnResize:true,
		enableRowReordering: false,
		showColumnMenu: false,
		enableSorting:true,
		selectedItems: $scope.selectedItems,
		columnDefs: [
			{field: 'elementSummary.valueDefSummary.name', displayName: 'Question',cellTemplate: nameTemplate},
            {field: 'elementSummary.valueDefSummary.variableName', displayName: 'Variable Name',width:125},
			{field: 'elementSummary.valueDefSummary.defaultWidgetTypeSummary.name', displayName: 'Answer Type',cellTemplate: widgetTypeTemplate,width:250},
            {field: 'elementSummary.valueDefSummary.defaultWidgetTypeSummary.name', displayName: 'Auto?',cellTemplate: autoTemplate,width:120},
            {field: 'elementSummary.valueDefSummary.defaultWidgetTypeSummary.name', displayName: 'Calculated?',cellTemplate: calcTemplate,width:120},
            {field: 'elementSummary.valueDefSummary.defaultWidgetTypeSummary.name', displayName: 'Show on Condition?',cellTemplate: condTemplate,width:160}
		],
		rowTemplate: '<div ng-dblclick="openEdit()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>',
		enableSorting: false
	};

    $scope.getCalculation=function(item){
        var result;
        if(item.elementSummary.valueDefSummary.isCalculatedValue==true){
            try{

                var ob = JSON.parse(item.elementSummary.valueDefSummary.metadata)
                result=ob.calculatedExpression;
            }catch(x){};
        }
        return result;
    }

    $scope.getAuto=function(item){
        var result;
        if(item.elementSummary.valueDefSummary.querySummary){
            try{

                result=item.elementSummary.valueDefSummary.querySummary.name;
            }catch(x){};
        }
        return result;
    }

    $scope.getCondition=function(item){
        var result;
        if(item.elementSummary.valueDefSummary.hasEnabledExpression==true){
            try{

                var ob = JSON.parse(item.elementSummary.valueDefSummary.metadata)
                result=ob.enabledExpression;
            }catch(x){};
        }
        return result;
    }

	$scope.canEdit=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.canAddRoot=function(){
		return true;
	};

	$scope.canAddSub=function(){
		var result = false;
		if($scope.selectedItems.length>0){
			if([1].indexOf($scope.selectedItems[0].elementSummary.elementTypeId)>=0){
				result=true;
			}
		}
		return result;
	};

	$scope.canAddSubHeading=function(){
		var result = false;
		if($scope.selectedItems.length>0){
			if([3].indexOf($scope.selectedItems[0].elementSummary.elementTypeId)>=0){
				result=true;
			}
		}
		return result;
	};

	$scope.canAddQuestion=function(){
		var result = false;
		if($scope.selectedItems.length>0){
			if([1].indexOf($scope.selectedItems[0].elementSummary.elementTypeId)>=0){
				result=true;
			}
		}
		return result;
	};

	$scope.canDelete=function(){
		return $scope.selectedItems.length>0;
	};

	$scope.swapRows = function(oldRow, newRow) {
		var tempSeq = oldRow.displaySeq;
		oldRow.displaySeq = newRow.displaySeq;
		newRow.displaySeq = tempSeq;
		$scope.formDefDetailSummary.elements = orderItems($scope.formDefDetailSummary.elements);
		$scope.gridData = $scope.formDefDetailSummary.elements;
		if (!$scope.$$phase)
			$scope.$apply();
		var index = $scope.formDefDetailSummary.elements.indexOf(newRow);
		DataService.post('data/MoveFormDefElement/update', {
			formDefElement1Id:oldRow.id,
			formDefElement2Id:newRow.id
		});
		$scope.highlightRow(index);
	};

	$scope.canMoveUp=function(){
		var result = false;
		if($scope.selectedItems.length>0){
			var item = $scope.selectedItems[0];
			var currIndex = $scope.gridData.indexOf(item)-1;
			var prevItem = null;
			while(currIndex>-1){
				var tempItem = $scope.gridData[currIndex];
				if(tempItem.hierarchy==item.hierarchy){
					prevItem=tempItem;
					break;
				}
				currIndex--;
			}
			if(prevItem){
				result=true;
			}
		}
		return result;
	};

	$scope.canMoveDown=function(){
		var result = false;
		if($scope.selectedItems.length>0){
			var item = $scope.selectedItems[0];
			var els =$scope.gridData;
			var currIndex = els.indexOf(item)+1;
			var prevItem = null;
			while(currIndex<els.length){
				var tempItem = els[currIndex];
				if(tempItem.hierarchy==item.hierarchy){
					prevItem=tempItem;
					break;
				}
				currIndex++;
			}
			if(prevItem){
				result=true;
			}
		}
		return result;
	};

	$scope.scrollToRow=function(index){
		var grid = $scope.gridOptions.ngGrid;
		grid.$viewport.scrollTop(grid.rowMap[index]*grid.config.rowHeight);
	};

	$scope.highlightRow=function(index){
		setTimeout(function(){
			$scope.gridOptions.selectItem(index,true);
			if (!$scope.$$phase)
				$scope.$apply();

		},10);
	};

	$scope.moveUp=function(){
		var item = $scope.selectedItems[0];
		var currIndex = $scope.gridData.indexOf(item)-1;
		var prevItem = null;
		while(currIndex>-1){
			var tempItem = $scope.gridData[currIndex];
			if(tempItem.hierarchy==item.hierarchy){
				prevItem=tempItem;
				break;
			}
			currIndex--;
		}
		if(prevItem){
			$scope.swapRows(prevItem,item);
		}
	};

	$scope.moveDown=function(item){
		var item = $scope.selectedItems[0];
		var els =$scope.gridData;
		var currIndex = els.indexOf(item)+1;
		var prevItem = null;
		while(currIndex<els.length){
			var tempItem = els[currIndex];
			if(tempItem.hierarchy==item.hierarchy){
				prevItem=tempItem;
				break;
			}
			currIndex++;
		}
		if(prevItem){
			$scope.swapRows(prevItem,item);
		}
	};

	$scope.openAddEditElement=function(itemToEdit,parentElement,elementTypeId){
		$rootScope.isNavigating=true;
		var d = $modal.open({
			keyboard:false,
			templateUrl:'../partials/addRootFormDefElement.html',
			controller:'AddRootFormDefElementCtrl',
			modalFade: false,
			backdropClick: false,
			resolve: {formDefDetailSummary: function(){return $scope.formDefDetailSummary;},parentElement:function(){return parentElement;},itemToEdit:function(){return itemToEdit;},elementTypeId:function(){return elementTypeId;}}
		});
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if(result){
				var oldItems = $scope.formDefDetailSummary.elements;

				if(itemToEdit==null){
					// push new item
					oldItems.push(result);
				}else{
					// sync existing item
					angular.copy(result,itemToEdit);
				}

				//reorder items
				$scope.formDefDetailSummary.elements=orderItems(oldItems);
				$scope.gridData=$scope.formDefDetailSummary.elements;
				if (!$scope.$$phase)
					$scope.$apply();
			}
		});
	};

	$scope.openAddSub=function(){
		var parentElement = null;
		if($scope.selectedItems.length>0){
			parentElement=$scope.selectedItems[0];
		}
		var elementTypeId=1;
		if(parentElement.elementSummary.elementTypeId==1){
			elementTypeId=3;
		}
		$scope.openAddEditElement(null,parentElement,elementTypeId);
	};

	$scope.openAddQuestion=function(){
		var parentElement = null;
		if($scope.selectedItems.length>0){
			parentElement=$scope.selectedItems[0];
		}
		$scope.openAddEditElement(null,parentElement,2);
	};

	$scope.openAddRoot=function(){
		$scope.openAddEditElement(null,null,1);
	};

	$scope.openEdit=function(){
		var el = null;
		if($scope.selectedItems.length>0){
			el=$scope.selectedItems[0];
		}

		var parentElement=null;
		angular.forEach($scope.gridData,function(value){
			if(value.elementId==el.elementSummary.parentElementId){
				parentElement=value;
				return false;
			}
		});

        if($scope.isSubForm(el)){
            $scope.gotoSubForm(el);
        }else{
            $scope.openAddEditElement(el,parentElement);
        }


	};

    $scope.editSubForm=function(el){
        var parentElement=null;
        angular.forEach($scope.gridData,function(value){
            if(value.elementId==el.elementSummary.parentElementId){
                parentElement=value;
                return false;
            }
        });
        $scope.openAddEditElement(el,parentElement);
    };

	$scope.openDelete=function(){
		var el = null;
		var currIndex=0;
		if($scope.selectedItems.length>0){
			el=$scope.selectedItems[0];
			currIndex=$scope.gridData.indexOf(el);
		}
		var deleteTitle = "item";
		if(el.elementSummary && el.elementSummary.valueDefSummary){
			deleteTitle=el.elementSummary.valueDefSummary.name;
		}
		var d = $modal.open({templateUrl: '../partials/deleteDialog.html',
			controller: 'DeleteDialogCtrl',
			modalFade: false,
			backdropClick: false,
			resolve: {options: function(){
				return {
				title:'Delete "'+deleteTitle+'"?',
				message:'Are you sure you want to delete "'+deleteTitle+'"?',
				callback:function(success,failure){
					DataService.post('data/FormDefElement/delete',{id:el.id}).then(function(result){
						success(result.data.item);
					},failure);
				}
			}}}});
		$rootScope.isNavigating=true;
		$rootScope.currDialog=d;
		d.result.then(function (result) {
			$rootScope.isNavigating=false;
			$rootScope.currDialog=null;
			if(result){
				var temp = [];
				angular.forEach(result.formDefIds,function(value){
					var item =$scope.findItem($scope.formDefDetailSummary.elements,value);
					if (item) {
						temp.push(item);
					}
				});
				$scope.formDefDetailSummary.elements=orderItems(temp);
				$scope.gridData=$scope.formDefDetailSummary.elements;
			}
			var temp = [];
			$scope.highlightRow(currIndex);
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
		DataService.post('data/FormDefDetail/view',{id:$stateParams.formDefId}).then(function(result){
			var summary = result.data.item;
			$scope.formDefDetailSummary=summary;
			$scope.title = summary.name;
			$scope.gridData=orderItems(summary.elements);
			$scope.processing=false;
		},function(data, status, headers, config){
			console.log('error %o',arguments);
		});
	}

	$scope.refreshRows();

}]);