myApp.controller('OutlineItemLookupDialog', ['$scope', '$modalInstance','DataService','ThemeService','studyDefId','formDefId','selectableDataTypes','selectableElementTypes', function ($scope, $modalInstance,DataService,ThemeService,studyDefId,formDefId,selectableDataTypes,selectableElementTypes) {
	$scope.title = 'Select Item';
	$scope.alerts = [];
	$scope.processing = false;
	$scope.objectStateTypes = [];
	$scope.dialogVisible=true;
	$scope.isLoading=false;
	$scope.outline=null;
    $scope.form={};
	$scope.items = [];
	$scope.selectedItem=null;
	$scope.studyDefId=studyDefId;
    $scope.formDefId=formDefId;
	$scope.selectableDataTypes = selectableDataTypes;
    $scope.selectableElementTypes = selectableElementTypes || [2];

	$scope.loadOutline=function(){
		$scope.isLoading=true;
		DataService.post('data/StudyOutline/view',{
				studyDefId:$scope.studyDefId,
                formDefId:$scope.formDefId
			}
		).then(
			function (newItem) {
				$scope.items=$scope.populateItems(newItem.data.item,0);
				$scope.isLoading=false;
			},
			function (error) {
				$scope.isLoading=false;
			}
		);
	};

	$scope.selectItem = function(item){
		if($scope.selectedItem==item){
			$scope.selectedItem=null;
		}else{
			$scope.selectedItem=item;
		}
	}

	$scope.canSelect = function(item){
		return $scope.selectableDataTypes.indexOf(item.dataTypeId)>-1 &&  $scope.selectableElementTypes.indexOf(item.elementTypeId)>-1;
	}

	$scope.parentClosed=function(node){
		var index = $scope.items.indexOf(node);
		var vis=false;
		var parentNode=node.parent;
		while(parentNode!=null){
			if(parentNode.isClosed==true){
				vis=true;
				parentNode=null;
			}else{
				parentNode=parentNode.parent;
			}
		}
		return vis;
	}

	$scope.getIndent=function(item){
		return {"margin-left":item.level*25+"px"};
	}

	$scope.toggleFolder=function(item){
		item.isClosed=!item.isClosed;

		angular.forEach($scope.items,function(node){
			node.hide = $scope.parentClosed(node);
		});
	}

	$scope.getFolderIcon=function(item){
//		var result = ThemeService.leafIcon;
        var result = ThemeService.getWidgetIcon(item.widgetTypeId,item.isClosed);
		if(item.items && item.items.length>0){
			if(item.isClosed){
				result = ThemeService.folderCloseIcon;
			}else{
				result = ThemeService.folderOpenIcon;
			}
		}
		return result;
	}

	$scope.populateItems=function(summary,indentLevel,parent){
		var result = [];
		if(summary.items){
			angular.forEach(summary.items,function(item){
				item.parent=parent;
				item.level=indentLevel;
				result.push(item);
				if(item.items){
					var tempItems = $scope.populateItems(item,indentLevel+1,item);
					result.push.apply(result,tempItems);
				}
			});
		}
		return result;
	}

	$scope.isSelected=function(item){
		if(item==$scope.selectedItem){
			return 'outlineItemLookupSelected';
		}else{
			return null;
		}
	}

	$scope.loadOutline();

	$scope.closeAlert = function (index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.dialogChanged = function(visible){
		$scope.dialogVisible=!visible;
	}

	$scope.close = function () {
		$modalInstance.close($scope.selectedItem);
	};

	$scope.cancel = function () {
		$modalInstance.close();
	};
}]);