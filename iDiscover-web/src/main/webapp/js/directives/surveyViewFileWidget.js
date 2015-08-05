myApp.directive('surveyViewFileWidget', ['$filter','$rootScope','$log','ThemeService','UserService','$filter','DataService','$state','$modal', function($filter,$rootScope,$log,ThemeService,UserService,$filter,DataService,$state,$modal) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/surveyViewFileWidget.html',
            scope:{
                valueDefSummary:'=',
                valueSummary:'=',
                formElement:'=',
                itemChanged:'&'
            },
            controller: function ($scope) {

                $scope.formattedValue=function(){
                    var result=null;
                    if($scope.valueSummary!=null && $scope.valueSummary.dateValue!=null){
                        result= 'Viewed on '+$filter('date')($scope.valueSummary.dateValue,'short');
                    }
                    return result;
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


                    $scope.valueSummary.dateValue=new Date();
                    var fn=$scope.itemChanged($scope.formElement);
                    if(fn){
                        fn($scope.formElement);
                    }


                };
            }
        };
    }]);