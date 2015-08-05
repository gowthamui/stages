'use strict';

/* Directives */

myApp.directive('notificationEditor', ['$filter','$rootScope','$log','DataService','$modal','ThemeService','MetadataService',function($filter,$rootScope,$log,DataService,$modal,ThemeService,MetadataService) {
	return {
		restrict: 'A',
		replace: true,
		terminal:true,
		templateUrl: '../partials/notificationEditor.html',
		scope:{
			notificationTypeId:'=',
			srcStudyDefFormDefId:'=',
			srcFormDefElementId:'=',
			studyDefId:'=',
			dialogChanged:'&'
		},
		link: function(scope, element, attrs) {
			scope.isLoading=true;
			scope.scheduleIcon = ThemeService.scheduleIcon;

			scope.getCaption=function(){
				if(scope.item){
					return scope.item.tarCaption+'  ';
				}else{
					return '';
				}
			}

			scope.openSchedule=function(){
				if(scope.dialogChanged){
					scope.dialogChanged(true)(true);
				}
				var d = $modal.open({
					keyboard:false,
					templateUrl:'../partials/notificationEditorCtrl.html',
					controller:'NotificationEditorCtrl',
					backdropClick: false,
					resolve: {studyDefId:function(){return scope.studyDefId},
						srcStudyDefFormDefId:function(){return scope.srcStudyDefFormDefId},
						srcFormDefElementId:function(){return scope.srcFormDefElementId},
						notificationTypeId:function(){return scope.notificationTypeId}
					}
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;
				d.result.then(function (result) {
					if(result){
						scope.item=result;
					}
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					if(scope.dialogChanged){
						scope.dialogChanged(false)(false);
					}
				},function(){
					if(scope.dialogChanged){
						scope.dialogChanged(false)(false);
					}
				});
			};

			scope.hasValue=function(){
				return scope.item && scope.item.id>0
			}

			scope.loadNotification=function(){
				DataService.post('data/Notification/view',{
					notificationTypeId:scope.notificationTypeId,
					srcFormDefElementId:scope.srcFormDefElementId,
					srcStudyDefFormDefId:scope.srcStudyDefFormDefId}
				).then(
					function (newItem) {
						var item=newItem.data.item;
						if(item && item.id>0){
							scope.item=item;
						}else{
							scope.item=null;
						}
						scope.isLoading = false;
					},
					function (error) {
						scope.isLoading = false;
					}
				);
			};
			scope.loadNotification();
		}
	};
}]);
