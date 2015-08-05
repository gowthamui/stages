myApp.controller('PasteLookupCtrl', ['$scope','DataService','ThemeService','$modalInstance','$log','parentItem', function ($scope,DataService,ThemeService,$modalInstance,$log,parentItem) {
    $scope.title='Paste Lookup Items';
    $scope.alerts=[];

    $scope.item={};
    $scope.parentItem=parentItem;

    $scope.formats=[
        {id:'ctn',name:'Caption, Text, Number'},
        {id:'cnt',name:'Caption, Number, Text'},
        {id:'nct',name:'Number, Caption, Text'},
        {id:'tcn',name:'Text, Caption, Number'}
    ];

    $scope.delimiters=[
        {id:'\t',name:'Tab'},
        {id:',',name:'Comma'}
    ];

    $scope.item.delimiter='\t';
    $scope.item.format='tcn';

    $scope.close=function(){
        $modalInstance.close();
    }


    $scope.select=function(){
        var result =[];

        var temp = $scope.item.pastedItems;
        if(temp){
            var rows=temp.split('\n');
            angular.forEach(rows,function(row){
                var cols = row.split($scope.item.delimiter);
                if(cols.length>0){

                    var newItem={};
                    if($scope.parentItem){
                        newItem.parentId=$scope.parentItem.id;
                    }

                    var index=$scope.item.format.indexOf('c');
                    if(cols.length>index){
                        newItem.name=cols[index];
                    }

                    index=$scope.item.format.indexOf('t');
                    if(cols.length>index){
                        newItem.stringValue=cols[index];
                    }

                    index=$scope.item.format.indexOf('n');
                    if(cols.length>index){
                        newItem.numberValue=cols[index];
                    }
                    result.push(newItem);
                }
            });
        }

        $modalInstance.close(result);
    }

}]);