myApp.directive('chartReview', ['$filter', 'DataService', 'ThemeService', '$filter', '$log', '$location', 'ThemeService','$sce', function ($filter, DataService, ThemeService, $filter, $log, $location, ThemeService, $sce) {
        return {
            replace: true,
            templateUrl: '../partials/chartReview.html',
            scope: {
                participantIdTag:'=',
                studyDef:'='
            },
            controller: function ($scope) {

                $scope.processing = false;
                $scope.noItemSelectedCaption='Select Item';
                $scope.selectedItem=null;
                $scope.selectedItemCaption=$scope.noItemSelectedCaption;
                $scope.selectedItems=[];
                $scope.gridData = [];
                $scope.columnNames=[];

                $scope.columnDefs=[];
                $scope.docColumn=null;

                $scope.chartReviewDocuments=[
                    {id:76091,caption:'History and Physical Report'},
                    {id:521031814,caption:'Allergy'},
                    {id:110640,caption:'ED Physician/LIP Report'},
                    {id:1450580,caption:'Annual Evaluation'},
                    {id:15053766,caption:'Clinical Notes'},
                    {id:82705,caption:'Family History'},
                    {id:521031995,caption:'Medication History'},
                    {id:681,caption:'Discharge Summary'}
                ];


                $scope.options=function(){
                    var result=[];
                    if($scope.studyDef){
                        angular.forEach($scope.studyDef.chartReviewSettings.documents,function(item){
                            angular.forEach($scope.chartReviewDocuments,function(doc){
                                if(doc.id==item){
                                    result.push(doc);
                                }
                            });
                        });
                    }
                    return result;
                }

                $scope.getCursorStyle=function(){
                    if($scope.selectedItems.length>0){
                        return {cursor:'copy'};
                    }else{
                        return {};
                    }
                }


                $scope.dragStart=function($event){
                    var data=null;
                    if($scope.selectedItems.length>0){
                        var temp=$scope.selectedItems[0]
                        var data="Chart Review for "+$scope.selectedItemCaption+" (";
                        var numItems=0;
                        angular.forEach($scope.columnNames,function(item,index){
                            if(temp['field_'+index] && $scope.docColumn!=('field_'+index)){
                                if(numItems>0){
                                    data+=', ';
                                }
                                numItems++;
                                if(item.indexOf("Date")>=1){
                                    data+=item+'='+$filter('date')(temp['field_'+index],'short');
                                }else{
                                    data+=item+'='+temp['field_'+index];
                                }
                            }
                        });
                        data+=')';
                    }
                    $event.originalEvent.dataTransfer.setData('chartreviewdocument',data);
                }



                $scope.gridOptions = {
                    data: 'gridData',
                    displayFooter: false,
                    displaySelectionCheckbox: false,
                    multiSelect: false,
                    enableRowReordering:false,
                    showColumnMenu: false,
                    showFilter:false,
                    enableCellSelection:false,
                    enableColumnResize:true,
                    enableColumnReordering:true,
                    enableRowSelection:true,
                    sortInfo:{
                        fields:['field_1'],
                        directions:['asc']
                    },
                    selectedItems: $scope.selectedItems,
                    columnDefs: 'columnDefs',
                    enableSorting:true
                };

                $scope.selectItem=function(item){
                    if(item){
                        $scope.processing = true;
                        $scope.columnDefs.length=0;
                        $scope.selectedItem=item;
                        $scope.gridData.length=0;
                        $scope.docHTML=null;
                        $scope.selectedItems.length=0;
                        $scope.selectedItemCaption="Loading...";
                        $scope.sortInfo={
                            fields:[],
                            directions:[]
                        };

                        DataService.post('data/ChartReview/query',{
                            queryId:item.id,
                            empi:$scope.participantIdTag
                        }).then(function(result){
                            var returnedItem=result.data.item;
                            $scope.columnNames=returnedItem.columnNames;

                            angular.forEach(returnedItem.columnNames,function(col,index){
                                var def={field: ('field_'+index), displayName: col};
                                if(col.indexOf("Date")>=1){
                                    def.cellFilter='date:"short"';
                                }
                                if(col.indexOf("DOCUMENT_TEXT")>=0){
                                    $scope.docColumn= ('field_'+index);
                                    def.hidden=true;
                                }else if(col.indexOf("Event ID")>=0){
                                    def.hidden=true;
                                }else{
                                    $scope.columnDefs.push(def);
                                }
                            });

                            var tempRows=[];
                            if(returnedItem.results){
                                angular.forEach(returnedItem.results,function(item){
                                    var tempItem = {};
                                    angular.forEach(item,function(col,index){
                                        tempItem['field_'+index]=col;
                                    });
                                    tempRows.push(tempItem);
                                });
                            }
                            $scope.gridData=tempRows;
                            $scope.selectedItems.length=0;
                            if(tempRows.length>0){
                                $scope.selectedItems.push(tempRows[0]);
                                $scope.setDocHTML(tempRows[0][$scope.docColumn]);
                            }
                            $scope.selectedItemCaption=item.caption;
                            $scope.processing = false;

                        },function(data, status, headers, config){
                            $scope.processing = true;
                            $log.log('error %o',arguments);
                        });
                    }

                }

                $scope.setDocHTML=function(html){
                    try{
                        $scope.docHTML= $sce.trustAsHtml(html);
                        if($scope.docHTML && $scope.docHTML.toString() && $scope.docHTML.toString().trim()==''){
                            $scope.docHTML='Document is empty.';
                        }
                    }catch(x) {
                        $scope.docHTML=html;
                    }
                }




                $scope.selectedRow=function(){
                    if($scope.selectedItems && $scope.selectedItems.length>0){
                        $scope.setDocHTML($scope.selectedItems[0][$scope.docColumn]);
                        return $scope.selectedItems[0];
                    }else{
                        return null;
                    }
                }

                $scope.$watch('participantIdTag',function(newValue,oldValue){
                    if(newValue && !$scope.selectedItem){
                        $scope.selectItem($scope.options[0]);
                    }
                });

            }
        };
    }]);