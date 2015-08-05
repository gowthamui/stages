'use strict';

/* Directives */

myApp.directive('selectFormDefElement', ['$filter','$document','$log','DataService','$modal','ThemeService',function($filter,$document,$log,DataService,$modal,ThemeService) {
	return {
		scope:{
			elementId:'=',
			formDefId:'=',
			widgetTypeId:'='
		},
		replace:true,
		templateUrl: '../partials/selectFormDefElement.html',
		link: function(scope, element, attrs) {
			scope.elementName='(No Question Selected)';
			scope.elements = [];
			scope.popupVisible=false;
			scope.loadingElements=true;

			if(scope.elementId!=null){
				scope.elementName='Loading...';
			}

			scope.canSelectElement = function(item){
                if(angular.isArray(scope.widgetTypeId)){
                    return scope.widgetTypeId.indexOf(item.elementSummary.valueDefSummary.defaultWidgetTypeId)>=0;
                }else{
				    return scope.widgetTypeId=='*' || scope.widgetTypeId==item.elementSummary.valueDefSummary.defaultWidgetTypeId;
                }
			};

			scope.isChecked = function(item){
				return scope.elementId==item.elementSummary.id;
			};

			scope.getFolderClass = function (item) {
				return ThemeService.getElementIcon(item);
			};

			scope.getIndent = function (item) {
				var str = item.hierarchy || '';
				var items = str.split('.');
				items.pop();
				return {
					"margin-left": items.length * ThemeService.indentPixels + 'px'
				}
			};


			scope.orderItems = function(items,parentId,parentHierarchy){
				var kids = [];
				var result =[];
				angular.forEach(items,function(value,key){
					if((!parentId && !value.elementSummary.parentElementId) || (value.elementSummary.parentElementId==parentId)){
						kids.push(value);
					}

					if(scope.elementId==value.elementSummary.id){
						scope.elementName=value.elementSummary.valueDefSummary.name;
					}
				});
				kids.sort(function(a,b){
					return a.displaySeq - b.displaySeq;
				});
				angular.forEach(kids,function(value,key){
					result.push(value);
					if(parentId){
						value.hierarchy=parentHierarchy?parentHierarchy:'';
						value.hierarchy+='.'+parentId;
					}
					var myKids = scope.orderItems(items,value.elementSummary.id,value.hierarchy);
					angular.forEach(myKids,function(kidVal){
						result.push(kidVal);
					});
				});
				return result;
			};

			scope.itemSelected=function(element,$event){
				if(scope.canSelectElement(element)){
					scope.elementId=element.elementSummary.id;
					scope.elementName=element.elementSummary.valueDefSummary.name;
				}
			}

			scope.togglePopupVisible=function($event){
				if ($event) {
					$event.preventDefault();
					$event.stopPropagation();
				}

				var s=scope;
				scope.popupVisible=!scope.popupVisible;
				if(scope.popupVisible){
					var close = function (event) {
						console.log(s.popupVisible);
						s.popupVisible=false;
						console.log(s.popupVisible);
						if (event) {
							event.preventDefault();
							event.stopPropagation();
						}
						$document.unbind('click', close);
						close = null;
						if (!s.$$phase)
							s.$apply();
					};

					$document.bind('click', close);
				}
			}

			// load items
			DataService.post('data/FormDefDetail/view',{id:scope.formDefId}).then(function(result){
				var summary = result.data.item;
				scope.elements=scope.orderItems(summary.elements);
				scope.loadingElements=false;

			},function(data, status, headers, config){
				console.log('error %o',arguments);
			});
		}
	};
}]);