myApp.controller('ObjectStateHistoryCtrl', ['$scope', '$modalInstance', 'DataService','title','tableName','rowId', function ($scope, $modalInstance, DataService,title,tableName,rowId) {
	$scope.title=title;
	$scope.processing = true;

	DataService.post('data/ObjectState/search',{tableName:tableName,rowId:rowId}).then(function(result){
		$scope.processing=false;
		$scope.history=result.data;
	},function(data, status, headers, config){
		console.log('error %o',arguments);
	});

	$scope.close = function (result) {
		$modalInstance.close();
	};

}]);