myApp.directive('terminologyTags', ['$filter','DataService','ThemeService','$log','$location','NotificationService', function ($filter,DataService,ThemeService,$log,$location,NotificationService) {
        return {
            replace:true,
            templateUrl: '../partials/terminologyTags.html',
            scope: {
                valueDefId:'=',
                tags:'='
            },
            link: function (scope, element, attrs, ngModel) {
                scope.types=[];
                scope.newTerminologyTypeId=null;
                scope.newValue=null;

                DataService.post('data/TerminologyType/search',{tableName:scope.tableName,query:scope.query}).then(function(result){
                    scope.types =result.data.items;

                },function(data, status, headers, config){
                    console.log('error %o',arguments);
                });

                scope.canAddItem=function(){
                    //return scope.newTerminologyTypeId && scope.newValue && scope.newValue.length>0;
                    return true;
                }

                scope.getTerminologyTypeSummary=function(id){
                    var result=null;
                    angular.forEach(scope.types,function(item){
                        if(item.id==id){
                            result=item;
                        }
                    });
                    return result;
                }

                scope.addItem=function(){
                    scope.tags.push({
                        valueDefId:scope.valueDefId,
                        value:scope.newValue,
                        terminologyTypeId:scope.newTerminologyTypeId,
                        terminologyTypeSummary:scope.getTerminologyTypeSummary(scope.newTerminologyTypeId)

                    });
                }

                scope.deleteItem=function(item){
                    var index=scope.tags.indexOf(item);
                    scope.tags.splice(index,1);
                }


            }
        };
    }]);
