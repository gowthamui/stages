'use strict';

/* Directives */

myApp.directive('lookupEditor', ['$filter','$rootScope','$log','DataService','$modal','ThemeService',function($filter,$rootScope,$log,DataService,$modal,ThemeService) {
	return {
		restrict: 'A',
		replace: true,
		templateUrl: '../partials/lookupEditor.html',
		transclude: true,
		controller: controller,
		scope:{
			lookupGroupId:'=',
			lookupGroup:'=',
            showDefaults:'=',
			dialogChanged:'&'
		}
	};

	function controller($scope,$attrs){
		var nameTemplate= '<div class="ngCellText" ng-class="col.colIndex()" ng-style="getIndent(row.entity)"><span ng-cell-text>{{row.getProperty(col.field)}}</span></div>';
		var stringValueTemplate= '<div class="ngCellText" ng-class="col.colIndex()" ><span ng-cell-text>{{row.getProperty(col.field)}}</span></div>';
		var numberValueTemplate= '<div class="ngCellText" ng-class="col.colIndex()" ><span ng-cell-text>{{row.getProperty(col.field)}}</span></div>';
		var cbTemplate= '<div class="ngCellText" ng-class="col.colIndex()" ng-show="!row.entity.isParent" ng-click="updateAllowsText(row.entity)" style="text-align: center;"><span ng-cell-text><input style="margin-top: 3px"  type="checkbox" ng-checked="isChecked(row.entity)"></span></div>';
		var rbTemplate= '<div class="ngCellText" ng-class="col.colIndex()" ng-show="!row.entity.isParent" ng-click="updateDefault(row.entity)" style="text-align: center;"><span ng-cell-text><input style="margin-top: 3px"  type="radio" ng-checked="isDefault(row.entity)"></span></div>';


		var orderItems = function(items, parentId, parentHierarchy) {
			var kids = [];
			var result =[];
			angular.forEach(items, function(value, key) {
				if ((!parentId && !value.parentId) || (value.parentId == parentId)) {
					kids.push(value);
				}
			});
			kids.sort(function(a, b) {
				return a.displaySeq - b.displaySeq;
			});
			angular.forEach(kids, function(value, keyIndex) {
				result.push(value);
				if (parentId) {
					value.hierarchy = parentHierarchy ? parentHierarchy : '';
					value.hierarchy += '.' + parentId;
				}
				var myKids = orderItems(items, value.id, value.hierarchy);
				value.isParent = myKids.length > 0;
				angular.forEach(myKids, function(kidVal, index) {
					result.push(kidVal);
				});
			});
			return result;
		};

		$scope.searchIcon = ThemeService.searchIcon;
		$scope.loading=true;
		$scope.gridData=[];
		$scope.currentId =-1;
		$scope.newLookupValue=null;
		$scope.selectedItems = [];

		$scope.openLookup=function(){
			if($scope.dialogChanged){
				$scope.dialogChanged(true)(true);
			}
			var d = $modal.open({
				keyboard:false,
				templateUrl:'../partials/lookupSearch.html',
				controller:'LookupSearchCtrl',
				backdropClick: false
			});
			$rootScope.isNavigating=true;
			$rootScope.currDialog=d;
			d.result.then(function (result) {
				$rootScope.isNavigating=false;
				$rootScope.currDialog=null;
				if(result){
					$scope.loadTemplate(result.id);
				}
				$scope.dialogChanged(false)(false);

			},function(){
				$scope.dialogChanged(false)(false);
			});
		}

        $scope.paste=function(){
            if($scope.dialogChanged){
                $scope.dialogChanged(true)(true);
            }

            var tempItem=null;
            if($scope.selectedItems.length>0){
                tempItem=$scope.selectedItems[0];
            }


            var d = $modal.open({
                keyboard:false,
                templateUrl:'../partials/pasteLookup.html',
                controller:'PasteLookupCtrl',
                backdropClick: false,
                resolve: {
                    parentItem:function(){return tempItem}
                }
            });
            $rootScope.isNavigating=true;
            $rootScope.currDialog=d;
            d.result.then(function (result) {
                $rootScope.isNavigating=false;
                $rootScope.currDialog=null;
                if(result){
                    angular.forEach(result,function(newItem){
                        newItem.displaySeq=$scope.getDisplaySeq();
                        newItem.id=$scope.getId();
                        newItem.allowsText=0;
                        $scope.gridData.push(newItem);
                    });
                    var newOrderedItems=orderItems($scope.gridData);
                    $scope.gridData.length=0;
                    $scope.gridData.push.apply($scope.gridData,newOrderedItems);
                    $scope.updateDefaults();
                }
                $scope.dialogChanged(false)(false);

            },function(){
                $scope.dialogChanged(false)(false);
            });
        }

        $scope.columnDefs = [];

		$scope.gridOptions = {
			data:'gridData',
			displayFooter: false,
			displaySelectionCheckbox: false,
			multiSelect: false,
			enableRowReordering:false,
			showColumnMenu: false,
			enableCellEditOnFocus: false,
			selectedItems: $scope.selectedItems,
			columnDefs:'columnDefs',
			enableSorting:false
		};

		$scope.getId=function(){
			$scope.currentId--;
			return $scope.currentId;
		};

		$scope.isChecked=function(item){
			return item.allowsText==1;
		}


		$scope.isDefault=function(item){
			return item.isDefault==true;
		}

		$scope.updateAllowsText=function(item){
			if(item.allowsText==1){
				item.allowsText=0;
			}else{
				item.allowsText=1;
			}
		}

		$scope.updateDefault=function(item){
			angular.forEach($scope.gridData,function(row){
				row.isDefault=item==row;
			});
		}

		$scope.addLookupValueOnEnter=function(evt){
			if(evt.keyCode==13 && $scope.hasText($scope.newLookupValue)){
				$scope.addLookupValue();
			}
		}

		$scope.canMoveLeft = function(){
			var result=false;
			if($scope.selectedItems.length>0){
				if($scope.selectedItems[0].parentId){
					result=true;
				}
			}
			return result;
		}

        $scope.canPaste = function(){
            var result=false;
            if($scope.selectedItems.length>0){
                result=true;
            }
            return result;
        }

		$scope.moveLeft = function() {
			if ($scope.selectedItems.length > 0 && $scope.canMoveLeft()) {
				var parentId = null;
				var parents = $scope.selectedItems[0].hierarchy.split('.');
				if (parents.length > 2) {
					parentId = parents[parents.length-2];
				}
				if (!parentId || parentId.length == 0) {
					parentId=null;
				}
				$scope.selectedItems[0].hierarchy = null;
				$scope.selectedItems[0].parentId = parentId;
				$scope.gridData = orderItems($scope.gridData);
				$scope.updateDefaults();
			}
		};

		$scope.updateDefaults=function(){
			var hasDefault=false;
			angular.forEach($scope.gridData,function(item){
				if(item.isDefault==true && item.isParent==false){
					hasDefault=true;
				}
				if(item.isParent==true){
					item.isDefault=false;
					item.allowsText=0;
				}
			});
			if(!hasDefault){
				var hasSetDefault=false;
				angular.forEach($scope.gridData,function(item){
					if(item.isParent){
						item.isDefault=false;
					}
					if(!hasSetDefault && item.isParent==false){
						item.isDefault=true;
						hasSetDefault=true;
					}
				});
			}
		}

		$scope.parentItem =function(){
			var parentItem = null;
			if($scope.selectedItems.length>0){
				var selectedItem = $scope.selectedItems[0];
				var selectedLength = 0;
				if(selectedItem.hierarchy){
					selectedLength = selectedItem.hierarchy.split('.');
				}
				var index =$scope.gridData.indexOf(selectedItem)-1;

				while(index>=0){
					var tempItem = $scope.gridData[index];
					var parentLen = 0;
					if(tempItem.hierarchy){
						parentLen=tempItem.hierarchy.split('.').length;
					}
					if(parentLen<selectedLength || (parentLen== selectedLength && tempItem.id!=selectedItem.parentId)) {
						parentItem = tempItem;
						break;
					}
					index--;
				}
			}
			return parentItem;
		}

		$scope.possibleParent =function(){
			var result = null;
			if($scope.selectedItems.length>0){
				var selectedItem = $scope.selectedItems[0];
				var index =$scope.gridData.indexOf(selectedItem)-1;
				while(index>=0 && !result){
					var tempItem = $scope.gridData[index];
					if(tempItem.hierarchy == selectedItem.hierarchy){
						result=tempItem;
					}
					index--;
				}
			}
			return result;
		}

		$scope.canMoveRight = function(){
			return $scope.possibleParent()!=null;
		}

		$scope.canRemove = function(){
			return $scope.selectedItems.length>0;
		}

		$scope.remove=function(){
			if($scope.canRemove()){
				var parentId = null;
				var selectedItem =$scope.selectedItems[0];
				var selIndex=$scope.gridData.indexOf(selectedItem);
				var parents = [];
				if(selectedItem.hierarchy){
					selectedItem.hierarchy.split('.');
				}
				if(parents.length>2){
					parentId = parents[parents.length-3];
				}

				angular.forEach($scope.gridData,function(item){
					if(item.parentId==selectedItem.id){
						item.hierarchy=null;
						item.parentId=parentId;

					}
				});

				$scope.gridData.splice($scope.gridData.indexOf(selectedItem),1);
				var newOrderedItems=orderItems($scope.gridData);
				$scope.gridData.length=0;
				$scope.selectedItems.length=0;
				$scope.gridData.push.apply($scope.gridData,newOrderedItems);
				$scope.updateDefaults();

				var selItem=null;
				if(selIndex<$scope.gridData.length){
					selItem=$scope.gridData[selIndex];
				}
				if(!selItem && $scope.gridData.length>0){
					selItem=$scope.gridData[0];
				}

				if(selItem){
					$scope.selectedItems.push(selItem);
				}
			}
		}

		$scope.previousItem =function(){
			var prevItem=null;
			if($scope.selectedItems.length>0){
				var selectedItem =$scope.selectedItems[0];
				var index = $scope.gridData.indexOf(selectedItem)-1;
				while(index>=0){
					var tempItem = $scope.gridData[index];
					if(tempItem.parentId==selectedItem.parentId){
						prevItem=tempItem;
						break;
					}
					index--;
				}
			}
			return prevItem;
		}

		$scope.nextItem =function(){
			var nextI=null;
			if($scope.selectedItems.length>0){
				var selectedItem =$scope.selectedItems[0];
				var index = $scope.gridData.indexOf(selectedItem)+1;
				while(index<$scope.gridData.length){
					var tempItem = $scope.gridData[index];
					if(tempItem.parentId==selectedItem.parentId){
						nextI=tempItem;
						break;
					}
					index++;
				}
			}
			return nextI;
		}

		$scope.canMoveUp= function(){
			return $scope.previousItem()!=null;
		}

		$scope.canMoveDown= function(){
			return $scope.nextItem()!=null;
		};

		$scope.moveUp = function(){
			var prevItem = $scope.previousItem();
			if($scope.selectedItems.length>0 && prevItem){
				var selectedItem = $scope.selectedItems[0];
				selectedItem.hierarchy=null;
				prevItem.hierarchy=null;
				var oldSeq=selectedItem.displaySeq;
				selectedItem.displaySeq=prevItem.displaySeq;
				prevItem.displaySeq=oldSeq;
				var newOrderedItems=orderItems($scope.gridData);
				$scope.gridData=newOrderedItems;
				$scope.updateDefaults();


			}
		};

		$scope.moveDown = function(){
			var nextI = $scope.nextItem();
			if($scope.selectedItems.length>0 && nextI){
				var selectedItem = $scope.selectedItems[0];
				selectedItem.hierarchy=null;
				nextI.hierarchy=null;
				var oldSeq=selectedItem.displaySeq;
				selectedItem.displaySeq=nextI.displaySeq;
				nextI.displaySeq=oldSeq;
				var newOrderedItems=orderItems($scope.gridData);
				$scope.gridData=newOrderedItems;
				$scope.updateDefaults();
			}
		};

		$scope.moveRight = function() {
			var parentItem = $scope.possibleParent();
			if ($scope.selectedItems.length > 0 && parentItem) {
				var selectedItem = $scope.selectedItems[0];
				selectedItem.hierarchy = null;
				parentItem.hierarchy = null;
				selectedItem.parentId = parentItem.id;
				$scope.gridData = orderItems($scope.gridData);
				$scope.updateDefaults();
			}
		};

		$scope.canAddLookupValue=function(){
			return $scope.newLookupValue!=null;
		};

		$scope.canAddIndentLookupValue=function(){
			return $scope.newLookupValue!=null && $scope.selectedItems.length>0;
		};

		$scope.hasText=function(item){
			var result=false;
			if(item){
				if(item.length>0){
					result=true;
				}
			}
			return result;
		};

		$scope.addLookupValue=function(){
			if($scope.hasText($scope.newLookupValue)){
				$scope.gridData.push({name:$scope.newLookupValue,allowsText:0,displaySeq:$scope.getDisplaySeq(),id:$scope.getId()});
				var newOrderedItems=orderItems($scope.gridData);
				$scope.gridData.length=0;
				$scope.gridData.push.apply($scope.gridData,newOrderedItems);
				$scope.newLookupValue=null;
				$scope.updateDefaults();
			}
		};

		$scope.addIndentLookupValue=function(){
			if($scope.selectedItems.length>0){
				$scope.gridData.push({name:$scope.newLookupValue,allowsText:0,displaySeq:$scope.getDisplaySeq($scope.selectedItems[0].parentId),id:$scope.getId(),parentId:$scope.selectedItems[0].id});
				var newOrderedItems=orderItems($scope.gridData);
				$scope.gridData.length=0;
				$scope.gridData.push.apply($scope.gridData,newOrderedItems);
				$scope.updateDefaults();
				$scope.newLookupValue=null;
			}

		}

		$scope.getIndent = function (item) {
			var str = item.hierarchy || '';
			var items = str.split('.');
			items.pop();
			return {
				"margin-left": items.length * ThemeService.indentPixels + 'px'
			}
		}

		$scope.getDisplaySeq = function(parentId){
			var num = 0;
			angular.forEach($scope.gridData,function(item){
				if(item.parentId==parentId){
					num=Math.max(item.displaySeq,num);
				}
			});

			return num+1;
		}

		$scope.$watch('gridData',function(newId){
			if($scope.lookupGroup){
				$scope.lookupGroup.values=$scope.gridData;
			}
		});

		$scope.resetList=function(newId){
			if(newId>0){
				DataService.post('data/LookupGroup/view',{id:newId}).then(
					function (newItem) {
						var item=newItem.data.item;
						var values =item?item.values:[];
						$scope.gridData=orderItems(values);
						$scope.updateDefaults();
						$scope.loading = false;
					},
					function (error) {
						$scope.alerts.push({msg: error.message || 'Unknown Server Error', type: 'error'});
						$scope.loading = false;
					}
				);
			}else{
				$scope.gridData=[];
				$scope.loading=false;
			}
		};

		$scope.loadTemplate=function(newId){
			if(newId>0){
				DataService.post('data/LookupGroup/view',{id:newId}).then(
					function (newItem) {
						var item=newItem.data.item;
						var tempItems =item?item.values:[];

						angular.forEach(tempItems,function(tempItem){
							tempItem.id=$scope.getId();
						});

						$scope.gridData=orderItems(tempItems);
						$scope.updateDefaults();
						$scope.loading = false;
					},
					function (error) {
						$scope.alerts.push({msg: error.message || 'Unknown Server Error', type: 'error'});
						$scope.loading = false;
					}
				);
			}else{
				$scope.gridData=[];
				$scope.loading=false;
			}
		};

		$scope.$watch('lookupGroupId',function(newId){
			$scope.resetList(newId);
		});

        $scope.$watch('showDefaults',function(newValue){
            var temp=[
            {field: 'name', displayName: 'Name',cellTemplate:nameTemplate,enableCellEdit: true},
            {field: 'stringValue', displayName: 'Text Value',width:90,cellTemplate:stringValueTemplate,enableCellEdit: true},
            {field: 'numberValue', displayName: '# Value',width:70,cellTemplate:numberValueTemplate,enableCellEdit: true},
            {field: 'allowsText', displayName: 'Allow Text?', width:90,cellTemplate:cbTemplate,enableCellEdit: false}
//			{field: 'parentId', displayName: 'parentId', width:80},
//			{field: 'id', displayName: 'id', width:80}
//			{field: 'hierarchy', displayName: 'hierarchy', width:150},
//			{field: 'displaySeq', displayName: 'seq', width:80}
            ];

            if(newValue==true){
                temp.push({field: 'isDefault', displayName: 'Default?', width:75,cellTemplate:rbTemplate,enableCellEdit: false});
            }
            $scope.columnDefs=temp;
        });
	};
}]);
