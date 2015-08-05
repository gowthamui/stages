'use strict';

/* Directives */

myApp.directive('highChart', ['$filter','$log','DataService','ChartService','$modal',function($filter,$log,DataService,ChartService,$modal) {
	return {
		restrict: 'EA',
		templateUrl: '../partials/highChart.html',
		scope: {
			chartParams: "=",
			chartId:"=",
			hideMaximize: "="
		},
		transclude:true,
		replace: true,

		link: function (scope, element, attrs) {
			var el = element.find('div.highChartHolder')[0];
			var chartsDefaults = {
				chart: {
					renderTo: el
				},
				credits:{
					enabled:false
				}
			};
			if (!scope.hideMaximize) {
				chartsDefaults.exporting = {
					buttons: {
						Maximize: {
							symbol: 'triangle',
							onclick: function() {
								$modal.open({
									template: '<a href="" ng-click="close()" class="close" style="opacity: 0.6; padding: 10px;"><i class="fa fa-times"></i></a><div class="modal-body" high-chart chart-params="chartParams" chart-id="chartId" hide-maximize=true style="top: 0; bottom: 0; left: 0; right: 25px; position: absolute !important; max-height: 1500px;"></div>',
									controller: function($scope, originalScope, $modalInstance) {
										$scope.chartParams = originalScope.chartParams;
										$scope.chartId = originalScope.chartId;
										$scope.close = function() {
											$modalInstance.dismiss('close');
										};
									},
									resolve: {
										originalScope: function() {
											return scope;
										}
									},
									windowClass: 'modalViewContent'
								});
							}
						}
					}
				};
			}
			scope.processing=false;

			//Update when charts data changes
			scope.$watch('chartParams',function(newValue,oldValue) {
				if(!newValue) return;
				// We need deep copy in order to NOT override original chart object.
				// This allows us to override chart data member and still the keep
				// our original renderTo will be the same
				scope.processing=true;
				var params={studyFormId:scope.chartParams.id};
				DataService.post('data/ChartData/view',{id:scope.chartId,parameters:params}).then(function(result){
					scope.drawChart(result.data.item);
					scope.processing=false;

				},function(data, status, headers, config){
					scope.processing=false;
					console.log('error %o',arguments);
				});

			});

			scope.drawChart = function(chartOptions) {
				var deepCopy = true;
				var newSettings = ChartService.chartOptionsForId(scope.chartId,chartOptions);

				$.extend(deepCopy, newSettings, chartsDefaults);
				var chart = new Highcharts.Chart(newSettings);
			};

			scope.getChartStyle = function() {
				if(scope.processing){
					return {visibility:'hidden'};
				}else{
					return {visibility:'visible'};
				}
			};
		}
	};
}]);