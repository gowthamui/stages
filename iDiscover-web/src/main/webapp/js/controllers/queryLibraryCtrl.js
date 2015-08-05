myApp.controller('QueryLibraryCtrl', ['$scope','$rootScope','DataService','$stateParams','$modal', function ($scope,$rootScope,DataService,$stateParams,$modal) {
    $scope.title='Query Library';
    $scope.selectedItems=[];
    $scope.gridData = [];
    $scope.showClosed=false;
    $scope.processing=false;

    $scope.getClosedCaption=function(isClosed){
        return isClosed?'Disabled':'';
    };
    var closedTemplate= '<div class="ngCellText" ng-class="col.colIndex()" ng-style="getIndent(row.entity)"><span ng-cell-text>{{getClosedCaption(row.getProperty(col.field))}}</span></div>';
    $scope.gridOptions = {
        data: 'gridData',
        displayFooter: false,
        displaySelectionCheckbox: false,
        multiSelect: false,
        enableRowReordering:false,
        showColumnMenu: false,
        sortInfo : {fields:['name'],directions:['asc']},
        showFilter:true,
        enableSorting:true,
        selectedItems: $scope.selectedItems,
        columnDefs: [
            {field: 'id', displayName: 'Id', width:50},
            {field: 'name', displayName: 'Name'},
            {field: 'description', displayName: 'Description'},
            {field: 'queryTypeSummary.name', displayName: 'Type',width:200},
            {field: 'queryCategorySummary.name', displayName: 'Category',width:200},
            {field: 'isClosed', displayName: 'Disabled?',cellTemplate:closedTemplate,width:100}

        ],
        rowTemplate: '<div ng-dblclick="openEdit()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
    };

    $scope.canEdit=function(){
        return $scope.selectedItems.length>0;
    };

    $scope.canAdd=function(){
        return true;
    };

    $scope.openAddEdit=function(itemToEdit){
        var d = $modal.open({
            templateUrl:'../partials/editQuery.html',
            controller:'EditQueryCtrl',
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
    $scope.getShowIcon=function(){
        return $scope.showClosed?'fa fa-check-square-o':'fa fa-square-o';
    };

    $scope.toggleClosed=function(){
        $scope.showClosed=!$scope.showClosed;
        $scope.refreshRows();
    };

    $scope.refreshRows=function(){
        $scope.processing=true;
        DataService.post('data/Query/search',{showClosedItems:$scope.showClosed}).then(function(result){
            var summary = result.data;
            $scope.gridData=summary.items;
            $scope.processing=false;
        },function(data, status, headers, config){
            console.log('error %o',arguments);
        });
    };

    $scope.refreshRows();

}]);