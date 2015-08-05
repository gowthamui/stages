'use strict';

/* Directives */

myApp.directive('editObjectPermissions', ['$filter','$log','DataService',function($filter,$log,DataService) {
	return {
		restrict: 'A',
		replace: true,
		templateUrl: '../partials/editObjectPermissions.html',
		scope:{
			tableName:'=',
			query:'=',
			filterRoles:'='
		},
		link: function(scope, element, attrs) {

			scope.accessType='Group';
			scope.accessList=[];
            scope.users=[];

            scope.getFullName=function(item){
                var result='';
                if(item.firstName!=null){
                    result+=item.firstName+' ';
                }
                if(item.lastName!=null){
                    result+=item.lastName;
                }
                return result;
            }

			DataService.post('data/AccessControlList/search',{tableName:scope.tableName,query:scope.query}).then(function(result){
				scope.accessList =result.data.items;

			},function(data, status, headers, config){
				console.log('error %o',arguments);
			});

			DataService.groups(function(data){
				scope.groups=data;
			});

			DataService.users(function(data){
                scope.users.length=0;
                angular.forEach(data,function(i){
                    i.fullNameAndId=i.lastName+', '+i.firstName+' ('+i.id+')';
                    scope.users.push(i);
                });
			});

            scope.canAddUser=function(){
                return scope.userRoleId && scope.newUserId;
            }

            scope.canAddGroup=function(){
                return scope.groupRoleId && scope.newGroupId;
            }

			scope.addUser=function(){

                var newItem={
                    tableName:scope.tableName,
                    query:scope.query,
                    roleId:scope.userRoleId,
                    accessUserId:scope.newUserId.id
                };

				DataService.post('data/AccessControlList/update',newItem).then(function(result){
					scope.accessList.push(result.data.item);
				},function(data, status, headers, config){
					console.log('error %o',arguments);
				});
			}

            scope.addGroup=function(){
                var newItem={
                    tableName:scope.tableName,
                    query:scope.query,
                    roleId:scope.groupRoleId,
                    groupId:scope.newGroupId
                };

                DataService.post('data/AccessControlList/update',newItem).then(function(result){
                    scope.accessList.push(result.data.item);
                },function(data, status, headers, config){
                    console.log('error %o',arguments);
                });
            }

			scope.clearItem=function(){
				scope.newUserId=null;
				scope.newGroupId=null;
				scope.userRoleId=null;
                scope.groupRoleId=null;
			}

			scope.deleteItem=function(item){
				DataService.post('data/AccessControlList/delete',{id:item.id}).then(function(result){
					scope.accessList.splice(scope.accessList.indexOf(item),1);

				},function(data, status, headers, config){
					console.log('error %o',arguments);
				});
			}


			DataService.post('data/Role/search',{filterByTableName:scope.tableName}).then(function(result){
				var results=[];
				if(angular.isArray(scope.filterRoles)){
					angular.forEach(result.data.items,function(item){
						if(scope.filterRoles.indexOf(item.id)>-1){
							results.push(item);
						}
					});
				}else{
					results=result.data.items;
				}
				scope.roles=results;
			});


		}
	};
}]);
