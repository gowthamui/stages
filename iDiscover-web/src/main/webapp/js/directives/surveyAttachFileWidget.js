myApp.directive('surveyAttachFileWidget', ['$filter','$rootScope','$log','ThemeService','UserService','DataService','$state', '$modal', function($filter,$rootScope,$log,ThemeService,UserService,DataService,$state,$modal) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/surveyAttachFileWidget.html',
            scope:{
                valueDefSummary:'=',
                valueSummary:'=',
                formElement:'=',
                itemChanged:'&'
            },
            controller: function ($scope) {

                $scope.dataUrl=null;

                $scope.hasFile=function(){
                    return  $scope.valueSummary && $scope.valueSummary.fileValue && $scope.valueSummary.fileValue.id>0;
                }

                $scope.formattedValue=function(){
                    var formattedResult=null;
                    if($scope.valueSummary && $scope.valueSummary.fileValue && $scope.valueSummary.fileValue.name){
                        formattedResult = $scope.valueSummary.fileValue.name;
                    }else{
                        formattedResult= 'Attached File';
                    }
                    if(formattedResult){
                        formattedResult+=' ';
                    }
                    return formattedResult;
                }

                $scope.showViewFile=function($event){
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }

                    var tempPath = $scope.valueDefSummary.fileValueId;
                    if(!tempPath){
                        tempPath=$scope.valueSummary.id;
                    }

                    var d = $modal.open({
                        templateUrl:'../partials/viewFileDialog.html',
                        controller:'ViewFileDialogCtrl',
                        windowClass: 'modalViewContent',
                        backdropClick: false,
                        resolve: {
                            title:function(){return $scope.valueDefSummary.name},
                            filePath:function(){return tempPath},
                            useSigned:function(){return false},
                            useSignature:function(){return false}
                        }
                    });


                };

                $scope.editFile=function($event){
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }

                    var d = $modal.open({
                        templateUrl:'../partials/editFileDialog.html',
                        controller:'EditFileDialogCtrl',
                        backdropClick: false,
                        resolve: {valueSummary:function(){return $scope.valueSummary},valueDefSummary:function(){return $scope.valueDefSummary}}
                    });

                    d.result.then(function (result) {
                        if(result){
                            if(!$scope.valueSummary.fileValue){
                                $scope.valueSummary.fileValue ={};
                            }
                            if(result.useExisting){
                                $scope.valueSummary.fileValue.name=result.name;
                            }else{
                                $scope.dataUrl=result.dataUrl;
                                $scope.valueSummary.fileValue.name=result.name;
                                $scope.valueSummary.fileValue.hasBytes=result.hasBytes;
                                $scope.valueSummary.fileValue.mimeType=result.mimeType;
                                if(result.hasBytes){
                                    $scope.valueSummary.fileValue.bytes=result.bytes;
                                    $scope.valueSummary.fileValue.filePath=null;

                                }else{
                                    $scope.valueSummary.fileValue.filePath=result.filePath;
                                    $scope.valueSummary.fileValue.bytes=null;
                                }
                            }
                            var fn=$scope.itemChanged($scope.formElement);
                            if(fn){
                                fn($scope.formElement);
                            }
                        }
                    });
                };
            }
        };
    }]);