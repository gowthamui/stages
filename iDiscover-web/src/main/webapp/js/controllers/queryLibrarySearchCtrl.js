myApp.controller('QueryLibrarySearchCtrl', ['$scope','DataService','ThemeService','$modalInstance','selectableTypes','queryId', function ($scope,DataService,ThemeService,$modalInstance,selectableTypes,queryId) {
    $scope.title='Queries';
    $scope.selectedItems=[];
    $scope.gridData = [];
    $scope.processing = true;
    $scope.selectableTypes=selectableTypes || [];

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
            {field: 'queryCategorySummary.name', displayName: 'Category'},
            {field: 'description', displayName: 'Description'},
            {field: 'queryTypeSummary.name', displayName: 'Type'}

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



    $scope.select=function(){
        var result =null;
        if($scope.selectedItems.length>0){
            result = $scope.selectedItems[0];
        }
        $modalInstance.close(result);
    }

    $scope.showDocBrowser=function(){
        return $scope.selectedItems.length>0;
    };

    $scope.doc=function(){
        var result=null;
        if($scope.selectedItems.length>0){
            var sel=$scope.selectedItems[0];
            result=sel.value;
        }
        return result;
    };

    $scope.search=function(){
        $scope.processing=true;
        $scope.gridData=[];
        if($scope.gridOptions && $scope.gridOptions.$gridScope){
            $scope.gridOptions.$gridScope.hasUserChangedGridColumnWidths = false;
        }

        DataService.post('data/Query/search',{formDefTypeId:1,showClosedItems:false}).success(function(result){
            var temp=[];
            angular.forEach(result.items,function(item){
                if($scope.selectableTypes.length>0){
                    if($scope.selectableTypes.indexOf(item.queryTypeId)>=0){
                        temp.push(item);
                    }
                }else{
                    temp.push(item);
                }
            });
            $scope.gridData=temp;
            $scope.processing=false;

            if($scope.gridOptions && $scope.gridOptions.$gridScope){
                $scope.gridOptions.$gridScope.hasUserChangedGridColumnWidths = false;
            }
//            $('.grid-container').trigger('resize');
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