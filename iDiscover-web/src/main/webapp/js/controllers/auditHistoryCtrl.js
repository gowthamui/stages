myApp.controller('AuditHistoryCtrl', ['$scope', '$modalInstance','DataService', 'valueSummary','valueDefSummary','originalValueId', function ($scope, $modalInstance,DataService, valueSummary,valueDefSummary,originalValueId) {
	$scope.title="Loading Audit History....";
	$scope.valueDefSummary=valueDefSummary;

	$scope.processing = true;

	DataService.post('data/AuditLog/search',{valueId:originalValueId}).then(function(result){
		$scope.processing=false;
		$scope.auditHistory=result.data;
		$scope.title=valueDefSummary.name+' Audit History';


		$scope.isNotAvailable=function(item){
			if(item.oldValueSummary && item.oldValueSummary.valueNoteId==1){
				return 'fa fa-check-square-o';
			}else{
				return null;
			}
		}

	},function(data, status, headers, config){
		console.log('error %o',arguments);

	});


	$scope.close = function (result) {
		$modalInstance.close();
	};

}]);