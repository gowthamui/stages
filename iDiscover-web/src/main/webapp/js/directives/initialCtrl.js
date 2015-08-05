'use strict';

/* Directives */

myApp.directive('initialCtrl', ['$rootScope', '$modal', function($rootScope, $modal) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/initialCtrl.html',
            scope:{
                valueSummary:'=',
                valueDefSummary:'=',
                formElement:'=',
                dialogChanged:'&',
                canEdit:'=',
                selectionChanged:'&'
            },
            link: function(scope, element, attrs) {
                scope.isLoading=false;
                scope.changeDialog=function(openClose){
                    if(scope.dialogChanged){
                        var d = scope.dialogChanged(openClose);
                        if(d){
                            d(openClose);
                        }
                    }
                };

                scope.getSignaturePath=function(){
                    var result = 'ws/clientData/image/ValueInitials/-1';
                    if(scope.valueSummary.clearValue){

                    }else if(scope.signaturePath){
                        result=scope.signaturePath;
                    } else if (scope.valueSummary && scope.valueSummary.id > 0) {
                    	scope.hasValue = true;
                        result = 'ws/clientData/image/ValueInitials/'+scope.valueSummary.id;
                    }
                    return result;
                };

                scope.changeSelection=function(bytes){
                    if(scope.selectionChanged){
                        var d = scope.selectionChanged(bytes,scope.formElement);
                        if(d){
                            d(bytes,scope.formElement);
                        }
                    }
                };
                scope.signaturePath=null;

                scope.togglePopupVisible = function($event) {
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }

                    scope.changeDialog(true);
                    var d = $modal.open({
                        keyboard:false,
                        templateUrl:'../partials/editInitialsDialog.html',
                        controller:'EditInitialsDialogCtrl',
                        windowClass: 'initialModal',
                        backdropClick: false,
                        resolve: {
                            title:function(){return scope.valueDefSummary?scope.valueDefSummary.name:'Edit Initials';},
                            description:function(){return '';},
                            valueId:function(){return scope.valueSummary?scope.valueSummary.id:-1;}
                        }
                    });
                    $rootScope.isNavigating=true;
                    $rootScope.currDialog=d;
                    d.result.then(function (result) {
                        $rootScope.isNavigating=false;
                        $rootScope.currDialog=null;
                        if (result) {
                        	scope.hasValue = true;
                            scope.signaturePath='data:image/png;base64,'+result.bytes;
                            scope.changeSelection(result.bytes);
                        }
                        scope.changeDialog(false);
                    },function(){
                        scope.changeDialog(false);
                    });
                };
            }
        };
    }]);