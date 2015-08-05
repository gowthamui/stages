myApp.directive('surveySignatureWidget', ['$filter','$rootScope','$log','ThemeService','MetadataService','UserService','DataService','$state', '$modal', function($filter,$rootScope,$log,ThemeService,MetadataService,UserService,DataService,$state,$modal) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/surveySignatureWidget.html',
            scope:{
                valueSummary:'=',
                valueDefSummary:'=',
                formElement:'=',
                itemChanged:'&'
            },
            controller: function ($scope) {
                $scope.data={

                }

                $scope.hasValue=function(){
                    return $scope.valueSummary.signatureValue!=null;
                }

                $scope.getSignaturePath=function(){
                    var result = 'ws/clientData/image/ValueSignature/-1';
                    var currValue = MetadataService.currentValue($scope.valueSummary,$scope.valueDefSummary);
                    if(currValue!=null){
                        if($scope.valueSummary.clearValue!=true){
                            try{
                                if(!$scope.signaturePath){
                                    result = 'ws/clientData/image/ValueSignature/'+currValue.value.valueId;
                                }else{
                                    result = $scope.signaturePath;
                                }
                            }catch(x){}
                        }
                    }
                    return result;

                }

                $scope.editSignature=function($event){

                    $scope.valueSummary.signatureValue= $scope.valueSummary.signatureValue || {};
                    var sigValue = $scope.valueSummary.signatureValue;
                    var d = $modal.open({
                        templateUrl:'../partials/surveyEditSignatureDialog.html',
                        controller:'SurveyEditSignatureDialogCtrl',
                        backdropClick: false,
                        resolve: {comments:function(){return ''},
                            title:function(){return $scope.valueDefSummary.name},
                            description:function(){return $scope.valueDefSummary.description},
                            signaturePath:function(){return $scope.signaturePath},
                            printedName:function(){return sigValue.printedName},
                            signatureValueId:function(){return sigValue.valueId}}
                    });
                    $rootScope.isNavigating=true;
                    $rootScope.currDialog=d;
                    d.result.then(function (result) {
                        $rootScope.isNavigating=false;
                        $rootScope.currDialog=null;
                        if(result){
                            $scope.signaturePath='data:image/png;base64,'+result.bytes;
                            sigValue.printedName=result.printedName;
                            sigValue.mimeType=result.mimeType;
                            sigValue.bytes=result.bytes;
                            $scope.valueSummary.clearValue=false;
                            $scope.valueSummary.modifiedOn=new Date();

                            var fn=$scope.itemChanged($scope.formElement);
                            if(fn){
                                fn($scope.formElement);
                            }
                        }
                    });
                }
            }
        };
    }]);