myApp.directive('surveyLookupWidget', ['$filter','$rootScope','$log','DataService','$modal','ThemeService','MetadataService','$q', function($filter,$rootScope,$log,DataService,$modal,ThemeService,MetadataService,$q) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/surveyLookupWidget.html',
            scope:{
                dialogChanged:'&',
                multiSelect:'=',
                useDefault:'=',
                lookupGroupLoaded:'&',
                defaultCaption:'=',
                valueDefSummary:'=',
                valueSummary:'=',
                formElement:'=',
                itemChanged:'&'

            },
            link: function(scope, element, attrs) {
                scope.isLoading=false;
                scope.usePopup=true;
                scope.selectedId=null;
                scope.selectedOther=null;
                scope.items=null;
                scope.selectedItems=[];

                scope.selectedOption = function(){
                    var result=null;
                    angular.forEach(scope.items,function(item){
                        if(item.id==scope.selectedId){
                            result=item;
                        }
                    });
                    return result;
                }

                scope.updateSelectedItems=function(){
                    scope.selectedItems=scope.getSelectedLookupItems();
                    if(scope.selectedItems && scope.selectedItems.length>0 && scope.selectedItems[0].id){
                        scope.selectedId=scope.selectedItems[0].id;
                    }else{
                        scope.selectedId=null;
                    }
                }

                scope.selectionChanged=function(returnedItems){
                    scope.valueSummary.lookupValues=scope.valueSummary.lookupValues || [];
                    // remove existing
                    var itemsToRemove=[];
                    angular.forEach( scope.valueSummary.lookupValues,function(existingItem){
                        var found=false;
                        angular.forEach(returnedItems,function(returnedItem){
                            if(returnedItem.id == existingItem.lookupValueId && !returnedItem.selected){
                                found=true;
                            }
                        });
                        if(found){
                            itemsToRemove.push(existingItem);
                        }
                    });
                    angular.forEach(itemsToRemove,function(itemToRemove){
                        var index =   scope.valueSummary.lookupValues.indexOf(itemToRemove);
                        scope.valueSummary.lookupValues.splice(index,1);
                    });

                    // add new items
                    angular.forEach(returnedItems,function(returnedItem){
                        if(returnedItem.selected){
                            var existingItem = scope.getExistingItem(returnedItem);
                            if(!existingItem){
                                existingItem=scope.createLookupValue(returnedItem);
                                scope.valueSummary.lookupValues.push(existingItem);
                            }
                            existingItem.otherValue=returnedItem.otherValue;
                        }
                    });

                    scope.updateSelectedItems();

                    var fn=scope.itemChanged(scope.formElement);
                    if(fn){
                        fn(scope.formElement);
                    }
                }




                scope.changeItem=function(){
                    var c =scope.selectedOption();
                    angular.forEach(scope.items,function(item){
                        item.selected=item.id== c.id;
                    });
                    c.otherValue=scope.selectedOther;

                    var newItems=scope.items;
                    scope.selectionChanged(newItems);
                }

                scope.getSelectedLookupItems=function(){
                    var currItems = scope.valueSummary.lookupValues?scope.valueSummary.lookupValues:[];
                    var tempItems = [];
                    angular.forEach(currItems,function(tempItem){
                        tempItems.push({
                                id:tempItem.lookupValueId,
                                otherValue:tempItem.otherValue,
                                lookupValueName:tempItem.lookupValueName}
                        );
                    });
                    return tempItems;

                }

                scope.getLookupCaption=function(){
                    var items = scope.selectedItems || [];
                    var result='';

                    angular.forEach(items,function(item){
                        if(item){
                            var hasOtherValue = false;
                            if(result.length>0){
                                result+=', ';
                            }
                            if(item.otherValue){
                                if(item.otherValue.length>0){
                                    hasOtherValue=true;
                                }
                            }
                            if(hasOtherValue){
                                result+= item.lookupValueName+': '+item.otherValue;
                            }else{
                                result+= item.lookupValueName;
                            }
                        }
                    });

                    return result;
                }

                scope.changeDialog=function(openClose){
                    if(scope.dialogChanged){
                        var d = scope.dialogChanged(openClose);
                        if(d){
                            d(openClose);
                        }
                    }
                }



                scope.changeLookupGroup=function(newGroup){
                    if(scope.lookupGroupLoaded){
                        var d = scope.lookupGroupLoaded(newGroup);
                        if(d){
                            d(newGroup);
                        }
                    }
                }

                scope.loadItems=function(){
                    var deferred = $q.defer();
                    if(scope.items){
                        scope.markLookupItemsSelected(scope.items);
                        deferred.resolve();
                    }else{
                        scope.isLoading=true;
                        DataService.post('data/LookupGroup/view',{id:scope.valueDefSummary.lookupGroupSummary.id}).then(function(result){
                            scope.isLoading=false;
                            var temp=result.data.item || {values:[]};
                            scope.changeLookupGroup(temp);
                            scope.items=scope.populateItems(temp.values,0);
                            var maxLevel=0;
                            angular.forEach(scope.items,function(item){
                                if(item.level>0){
                                    maxLevel=1;
                                }
                            });
                            if(maxLevel>0 || scope.multiSelect==true){
                                scope.usePopup=true;
                            }else{
                                scope.usePopup=false;
                            }

                            // check for defaults
                            if(scope.useDefault==true && (!scope.selectedItems || scope.selectedItems.length==0)){
                                angular.forEach(scope.items,function(tmp){
                                    if(tmp.isDefault==true){
                                        tmp.selected=true;
                                        scope.selectedItems.push(tmp);

                                        scope.selectionChanged(scope.selectedItems);
                                        return;
                                    }
                                });
                                scope.markLookupItemsSelected(scope.selectedItems);
                            }

                            deferred.resolve();
                        },function(data, status, headers, config){
                            console.log('error %o',arguments);
                            scope.isLoading=false;
                            deferred.reject();
                        });

                    }
                    return deferred.promise;
                }

                scope.populateItems=function(summaryItems,indentLevel,parent){
                    var result = [];
                    var tempItems = [];
                    angular.forEach(summaryItems,function(item){
                        var parentId=item.parentId?item.parentId:0;
                        var topId=parent?parent.id:0;
                        if(parentId==topId){
                            item.parent=parent;
                            item.level=indentLevel;
                            result.push(item);
                            tempItems =  scope.populateItems(summaryItems,indentLevel+1,item);
                            item.items=tempItems;
                            if(tempItems.length>0){
                                result.push.apply(result,tempItems);
                            }
                        }
                    });
                    scope.markLookupItemsSelected(result);
                    return result;
                }

                scope.markLookupItemsSelected=function(items){

                    angular.forEach(items,function(item){
                        item.selected=false;
                        angular.forEach(scope.selectedItems,function(selectedId){
                            if(item.id==selectedId.id){
                                item.otherValue=selectedId.otherValue;
                                item.selected=true;
                                scope.selectedId=item.id;
                                scope.selectedOther=item.otherValue;
                            }
                        });
                    });
                }

                scope.togglePopupVisible=function($event){
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }
                    if(!scope.isLoading){
                        var promise=scope.loadItems();
                        promise.then(function(){
                            scope.changeDialog(true);
                            var d = $modal.open({
                                keyboard:false,
                                templateUrl:'../partials/lookupCtrlDialog.html',
                                controller:'LookupCtrlDialog',
                                backdropClick: false,
                                resolve: {
                                    caption:function(){return scope.valueDefSummary.name},
                                    multiSelect:function(){return scope.multiSelect},
                                    lookupGroupSummary:function(){return scope.valueDefSummary.lookupGroupSummary;},
                                    items:function(){return scope.items;}
                                }
                            });
                            $rootScope.isNavigating=true;
                            $rootScope.currDialog=d;
                            d.result.then(function (result) {
                                $rootScope.isNavigating=false;
                                $rootScope.currDialog=null;
                                if(result){
                                    // do something
                                    scope.selectionChanged(result);
                                }
                                scope.changeDialog(false);
                            },function(){
                                scope.changeDialog(false);
                            });
                        });
                    }
                }

                scope.createLookupValue=function(item){
                    var result = {};
                    result.lookupValueId=item.id;
                    result.lookupValueName=item.name;
                    result.otherValue=item.otherValue;
                    result.id=item.id;
                    result.name=item.name;
                    return result;
                }

                scope.getExistingItem=function(selectedItem){
                    var selectedItems =  scope.valueSummary.lookupValues || [];
                    var oldItem=null;
                    angular.forEach(selectedItems,function(existingItem){
                        if(selectedItem.id == existingItem.lookupValueId){
                            oldItem=existingItem;
                        }
                    });
                    return oldItem;
                }

                scope.$watch('valueDefSummary',function(newValue,oldValue){
                    if(newValue && scope.valueDefSummary.lookupGroupSummary){
                        scope.loadItems();
                    }
                });

                scope.$watch('valueSummary',function(newValue,oldValue){
                    scope.updateSelectedItems();
                });

                scope.changeOther=function($event){
                    var c = scope.selectedOption();
                    if(c!=null && c.otherValue!= scope.selectedOther){
                        scope.changeItem();
                    }
                }
            }
        };
    }]);
