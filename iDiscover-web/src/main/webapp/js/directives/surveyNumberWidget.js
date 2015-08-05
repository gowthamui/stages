myApp.directive('surveyNumberWidget', ['$filter','$rootScope','$log','ThemeService','UserService','DataService','$state','$q', function($filter,$rootScope,$log,ThemeService,UserService,DataService,$state,$q) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/surveyNumberWidget.html',
            scope:{
                valueSummary:'=',
                valueDefSummary:'=',
                formElement:'=',
                itemChanged:'&'
            },
            controller: function ($scope) {

                if(!$scope.valueSummary.lookupValueSummary){
                    $scope.valueSummary.lookupValueSummary={};
                }

                $scope.data={items:[],itemsLoaded:false};
                $scope.isLoading=false;
                $scope.selectedId=null;
                $scope.selectedOther=null;

                $scope.lookupAllowsText=function(){
                    var result=false;
                    if($scope.valueSummary.lookupValueSummary){
                        angular.forEach($scope.data.items,function(item){
                            if(item.id==$scope.valueSummary.lookupValueSummary.id){
                                result=item.allowsText==1;
                                return;
                            }
                        });
                    }
                    return result;
                }

                $scope.populateItems=function(summaryItems,indentLevel,parent){
                    var result = [];
                    var tempItems = [];
                    angular.forEach(summaryItems,function(item){
                        var parentId=item.parentId?item.parentId:0;
                        var topId=parent?parent.id:0;
                        if(parentId==topId){
                            item.parent=parent;
                            item.level=indentLevel;
                            result.push(item);
                            tempItems =  $scope.populateItems(summaryItems,indentLevel+1,item);
                            item.items=tempItems;
                            if(tempItems.length>0){
                                result.push.apply(result,tempItems);
                            }
                        }
                    });
                    return result;
                }

                $scope.loadItems=function(){
                    var deferred = $q.defer();
                    if($scope.data.itemsLoaded){
                        deferred.resolve();
                    }else{
                        $scope.isLoading=true;
                        $scope.data.itemsLoaded=true;
                        DataService.post('data/LookupGroup/view',{id:$scope.valueDefSummary.lookupGroupSummary.id}).then(function(result){
                            $scope.isLoading=false;
                            var temp=result.data.item || {values:[]};

                            $scope.data.items=$scope.populateItems(temp.values,0);
                            var maxLevel=0;
                            angular.forEach($scope.data.items,function(item){
                                if(item.level>0){
                                    maxLevel=1;
                                }
                            });


                            // check for defaults
                            if(!$scope.valueSummary.lookupValueSummary.id || $scope.valueSummary.lookupValueSummary.id<1){
                                angular.forEach($scope.data.items,function(tmp){
                                    if(tmp.isDefault==true){
                                        $scope.valueSummary.lookupValueSummary.id=tmp.id;
                                        return;
                                    }
                                });
                            }

                            deferred.resolve();
                        },function(data, status, headers, config){
                            console.log('error %o',arguments);
                            $scope.isLoading=false;
                            deferred.reject();
                        });

                    }
                    return deferred.promise;
                }

                $scope.$watch('valueDefSummary.lookupGroupSummary',function(newValue,oldValue){
                    if(newValue){
                        $scope.loadItems();
                    }
                });

                $scope.recordAudit=function(){
                    var fn=$scope.itemChanged($scope.formElement);
                    if(fn){
                        if($scope.valueDefSummary.lookupGroupSummary==null){
                            fn($scope.formElement);
                        }else{
                            if($scope.valueSummary.numberValue && $scope.valueSummary.lookupValueSummary && $scope.valueSummary.lookupValueSummary.id>0){
                                fn($scope.formElement);
                            }
                        }

                    }

                }
            }
        };
    }]);