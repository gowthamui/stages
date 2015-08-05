myApp.controller('QueryResultsCtrl', ['$scope', '$modalInstance','DataService','queryResult', function ($scope, $modalInstance,DataService,queryResult) {
    $scope.title = 'Query Results';
    $scope.alerts = [];
    $scope.processing = false;

    var tempRows=[];
    if(queryResult && queryResult.results){
        angular.forEach(queryResult.results,function(item){
            var tempItem = {};
            angular.forEach(item,function(col,index){
                tempItem[('field_'+index)]=col;
            });
            tempRows.push(tempItem);
        });
    }
    $scope.gridData=tempRows;


    var colDefs=[];
    if(queryResult && queryResult.results){
        angular.forEach(queryResult.columnNames,function(item,index){
            colDefs.push({
                field:('field_'+index),
                displayName:item
            });
        });
    }

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };


    $scope.gridOptions = {
        data: 'gridData',
        displayFooter: false,
        displaySelectionCheckbox: false,
        multiSelect: false,
        enableRowReordering:false,
        enableColumnReordering:true,
        enableColumnResize:true,
        showFilter:true,
        showColumnMenu: false,
        columnDefs: colDefs,
        enableSorting: true
    };

    $scope.getRow=function(row){
        var temp = [];
        angular.forEach(row,function(item,index){
            temp.push({id:index,val:item});

        });
        return temp;
    }

    $scope.close = function () {
        $modalInstance.close();
    };
}]);