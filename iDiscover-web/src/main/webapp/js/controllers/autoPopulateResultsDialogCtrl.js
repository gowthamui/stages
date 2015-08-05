myApp.controller('AutoPopulateResultsDialogCtrl', ['$scope','DataService','ThemeService','$modalInstance','results', function ($scope,DataService,ThemeService,$modalInstance,results) {
    $scope.data=results;
    $scope.title=$scope.data.querySummary.name;
    $scope.selectedItems=[];
    $scope.gridData = [];
    $scope.processing = false;

    $scope.hasDocumentBrowser=false;
    $scope.columnDefs=[];
    $scope.docColumn=null;


    angular.forEach($scope.data.columnNames,function(col,index){
        var def={field: ('field_'+index), displayName: col};
        if(col.indexOf("Date")>=1){
            def.cellFilter='date:"short"';
        }
        if(col.indexOf("DOCUMENT_TEXT")>=0){
            $scope.hasDocumentBrowser=true;
            $scope.docColumn= ('field_'+index);
        }else{
            $scope.columnDefs.push(def);
        }
    });

    var tempRows=[];
    if($scope.data.results){
        angular.forEach($scope.data.results,function(item){
            var tempItem = {};
            angular.forEach(item,function(col,index){
                tempItem['field_'+index]=col;
            });
            tempRows.push(tempItem);
        });
    }
    $scope.gridData=tempRows;

    $scope.showDocBrowser=function(){
        $(window).resize();
        return $scope.selectedItems.length>0 && $scope.hasDocumentBrowser==true;
    };

    $scope.doc=function(){
        var result=null;
        if($scope.hasDocumentBrowser==true && $scope.selectedItems.length>0){
            var sel=$scope.selectedItems[0];
            result=sel[$scope.docColumn];
        }
        return result;
    };

    $scope.gridOptions = {
        data: 'gridData',
        displayFooter: false,
        displaySelectionCheckbox: false,
        multiSelect: false,
        enableRowReordering:false,
        showColumnMenu: false,
        showFilter:true,
        enableSorting:true,
        enableCellSelection:true,
        enableColumnResize:true,
        enableColumnReordering:true,
        enableRowSelection:true,
        selectedItems: $scope.selectedItems,
        columnDefs: 'columnDefs',
        enableSorting:true,
        rowTemplate: '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-dblclick="select(row.entity[col.field])" ng-cell></div></div>'
    };

    $scope.canSelect=function(){
        return $scope.selectedItems.length>0;
    }

    $scope.close=function(){
        $modalInstance.close();
    }

    $scope.select=function(result){
        $modalInstance.close({item:result});
    }

}]);