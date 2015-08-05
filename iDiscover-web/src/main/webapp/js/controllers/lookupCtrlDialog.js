myApp.controller('LookupCtrlDialog', ['$scope', '$modalInstance','DataService','ThemeService','lookupGroupSummary','multiSelect','items','caption',
    function ($scope, $modalInstance,DataService,ThemeService,lookupGroupSummary,multiSelect,items,caption) {

    $scope.title = caption;
    $scope.dialogVisible=true;
    $scope.items = items ? items.slice():[];
    $scope.isLoading=false;
    $scope.form={};
    $scope.multiSelect=multiSelect;
    $scope.lookupGroupSummary=lookupGroupSummary;


    $scope.canSelect=function(item){
        return (item.items?item.items.length:0)==0;
    };

    $scope.selectItem=function(item){

        var newVal=!item.selected;
        if(newVal || $scope.multiSelect){
            item.selected=newVal;
            if(!$scope.multiSelect && newVal){
                angular.forEach($scope.items,function(tempItem){
                    if(tempItem!=item){
                        tempItem.selected=false;
                    }
                });
            }
        }
    };

    $scope.getCaption=function(item){
        return item.name;
    };

    $scope.goto=function(item,$event){
        if($scope.canSelect(item)){
            $scope.selectItem(item);
        }
        return true;
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

    $scope.getToggleIcon=function(){
        return $scope.allChecked()?'fa fa-square-o':'fa fa-check-square-o';
    };

    $scope.allChecked=function(){
        var all=true;
        if($scope.items){
            angular.forEach($scope.items,function(item){
                if($scope.canSelect(item)){
                    if(!item.selected){
                        all=false;
                    }
                }
            });
        }
        return all;
    }

    $scope.getToggleAllText=function(){
        return $scope.allChecked()?'Deselect All':'Check All';
    }

    $scope.toggleAll=function($event){
        try{
            $event.preventDefault();
        if($scope.allChecked()){
            angular.forEach($scope.items,function(item){
                item.selected=false;
                item.otherValue=null;
            });
        }else{

            angular.forEach($scope.items,function(item){
                if($scope.canSelect(item)){
                   item.selected=true;
                }
            });
        }
        }catch (x){
            console.log(x);
        }
    }

    $scope.parentClosed=function(node){
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

    $scope.getFolderIcon=function(item){
        var result = ThemeService.folderOpenIcon;
        if(item.isClosed && item.items!=null && item.items.length>0){
            result = ThemeService.folderCloseIcon;
        }
        if(item.level==0 && (item.items==null || item.items.length==0)){
            result = ThemeService.leafIcon;
        }
        return result;
    }

    $scope.getFolderStyle=function(item){
        var result = {visibility:'hidden'};
        if(item.items!=null && item.items.length>0){
            result.visibility='visible';
        }else if((item.items==null || item.items.length==0) && item.level==0){
            result.visibility='visible';
            result['margin-left']='10px';
        }
        return result;
    }

    $scope.dialogChanged = function(visible){
        $scope.dialogVisible=!visible;
    }

    $scope.close = function () {
        $modalInstance.close($scope.items);
    };

    $scope.cancel = function () {
        $modalInstance.close();
    };

}]);