myApp.factory( 'ChartService',
	function() {
		var svc = {};
		svc.chartOptionsForId=function(id,values){
			var result={};
			if (id=='participantsOverTime') {
				result = values;
			} else if (id=='participantsByStatus') {
				var data = [];
				var series = [];
				var total = 0;
				angular.forEach(values.series[0], function(item) {
					if (item.name == 'Enrolled')
						data.push({name: item.name, y: item.valueX, drilldown: item.category, color: '#FFA500'});
					else
						data.push({name: item.name, y: item.valueX, drilldown: item.category});
					if (item.drillDown) {
						angular.forEach(item.drillDown, function(drillDown) {
							var index = -1;
							angular.forEach(series, function(serie, position) {
								if (serie.id == item.category)
									index = position;
							});
							if (index == -1)
								series.push({id: item.category, name: item.name, data: [[drillDown.name, drillDown.valueX]]});
							else
								series[index].data.push([drillDown.name, drillDown.valueX]);
						});
					}
					total += item.valueX;
				});
				result = {
					chart:{
						type:'column'
					},
					title:{
						text:'Participants By Status'
					},
					xAxis: {
						categories: true
					},
					drilldown: {
				        series: series
				    },
					yAxis: {
						title: {
							text: 'Participants'
						}
					},
					legend: {
				        enabled: false
				    },
					tooltip: {
						formatter: function() {
		                    return this.y + ' participant(s): <b>' + Highcharts.numberFormat(this.y / total * 100) + '%</b>';
		                }
					},
					series: [{
						name:'Participants',
						colorByPoint: true,
						data: data
					}]
				};
			} else if (id=='pendingApprovals') {
				var categories = [];
				angular.forEach(values.series, function(serie) {
					angular.forEach(serie.data, function(data) {
						if (categories.indexOf(data.name) == -1) {
							categories.push(data.name);
						}
					});
				});
				var series = [];
				angular.forEach(values.series, function(item) {
					var serie = {name: item.name};
					serie.data = normalizeMissingData(item.data, categories);
					series.push(serie);
				});
				result = values;
			    result.xAxis = {categories: categories};
			    result.series = series;
			} else if (id=='numberOfElements') {
				result = values;
				result.tooltip = {
					formatter: function() {
						return  this.point.z + ' participant(s) answered<br>' + this.y + ' question(s) durring ' + Highcharts.dateFormat('%b %Y', new Date(this.x));
					}
				};
			} else if (id=='participantsPerOrgaziation') {
				result = values;
			}
			return result;
		};
		return svc;
	}
);

function normalizeMissingData(data, categories) {
	var existingCategories = [];
    var normalizedData = [];
    for (var i = 0; i < data.length; i++) {
    	var existingData = [data[i].name, data[i].y];
        existingData[0] = $.inArray(existingData[0], categories);
        existingCategories.push(existingData[0]);
        normalizedData.push(existingData);
    }
    for (var i = 0; i < categories.length; i++) {
    	if ($.inArray(categories[i], existingCategories) == -1) {
    		normalizedData.unshift([categories[i], 0]);
    	}
    }
    return normalizedData;
}