'use strict';

/* Directives */

myApp.directive('auditText', ['$filter','$rootScope','$log','DataService','$modal','ThemeService','MetadataService',function($filter,$rootScope,$log,DataService,$modal,ThemeService,MetadataService) {
	return {
		restrict: 'A',
		replace: true,
		terminal:true,
		templateUrl: '../partials/auditText.html',
		scope:{
			hasValue:'=',
			originalValueId:'=',
			valueSummary:'=',
			currentValueSummary:'=',
			valueDefSummary:'='
		},
		link: function(scope, element, attrs) {

			scope.auditHistoryIcon=ThemeService.auditHistoryIcon;

			scope.modifiedMessage = function(currValue){
				var result = '';
				if(currValue){
					if(currValue.modifiedBy){
						result+= currValue.modifiedBy;
					}
					if(currValue.modifiedOn){
						result+=' on '+ $filter('date')(currValue.modifiedOn,'short');
					}
				}
				return result;
			}

			scope.formatValue=function(){
				var formattedResult=MetadataService.currentValue(scope.valueSummary,scope.valueDefSummary).formattedValue;
				return formattedResult;
			}

			scope.showAuditHistory=function(){
				var currValue = scope.valueSummary;
				var currDef= scope.valueDefSummary || {};
				var d = $modal.open({
					templateUrl:'../partials/auditHistory.html',
					controller:'AuditHistoryCtrl',
					backdropClick: false,
					resolve: {valueSummary:function(){ return currValue},valueDefSummary:function(){ return currDef},originalValueId:function(){return scope.originalValueId}}
				});
				$rootScope.isNavigating=true;
				$rootScope.currDialog=d;
				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
					if(result){
						if(itemToEdit==null){
							// push new item
							$scope.gridData.push(result.item);
						}else{
							// sync existing item
							angular.copy(result.item,itemToEdit);
						}
						if (!$scope.$$phase)
							$scope.$apply();
					}
				});
			}


		}
	};
}]);
