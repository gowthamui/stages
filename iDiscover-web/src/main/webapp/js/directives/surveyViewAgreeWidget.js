myApp.directive('surveyViewAgreeWidget', ['$filter','$rootScope','$log','ThemeService','UserService','DataService','$state','$modal', function($filter,$rootScope,$log,ThemeService,UserService,DataService,$state,$modal) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/surveyViewAndAgreeWidget.html',
            scope:{
                valueSummary:'=',
                valueDefSummary:'=',
                formElement:'=',
                itemChanged:'&'
            },
            controller: function ($scope) {
                $scope.formattedValue=function(){
                    var result=null;
                    if($scope.valueSummary.boolValue!=null){
                        if($scope.valueSummary.boolValue){
                            result= 'Agreed on '+$filter('date')($scope.valueSummary.modifiedOn,'short');
                        }else{
                            result= 'Disagreed on '+$filter('date')($scope.valueSummary.modifiedOn,'short');
                        }
                    }
                    return result;
                }
                $scope.showViewAndAgree=function($event){
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }

                    var d = $modal.open({
                        templateUrl:'../partials/viewAndAgreeDialog.html',
                        controller:'ViewAndAgreeDialogCtrl',
                        windowClass: 'modalViewContent',
                        backdropClick: false,
                        resolve: {valueSummary:function(){return $scope.valueSummary},valueDefSummary:function(){return $scope.valueDefSummary},canEdit:function(){return true}}
                    });

                    d.result.then(function (result) {
                        if(result){
                            $scope.valueSummary.boolValue=result.result;
                            $scope.valueSummary.modifiedOn=new Date();

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