myApp.controller('StudyDefDashboardCtrl', ['$scope','DataService','$stateParams','MetadataService', function ($scope,DataService,$stateParams,MetadataService) {
	$scope.title='Dashboard';
	$scope.processing=false;
	$scope.selectedItem=null;
	$scope.gridData = [];
	$scope.acl=[];
	$scope.organizations = [];

	$scope.onItemSelected = function(item) {
		$scope.selectedItem = item;
		$scope.selectedOrganization = null;
		$scope.dashboard = '../partials/studyDefDashboard/studyDashboard.html';
	};
	
	$scope.selectOrganization = function(organization) {
		$scope.selectedItem = null;
		$scope.selectedOrganization = organization;
		$scope.dashboard = '../partials/studyDefDashboard/organizationDashboard.html';
	};

	$scope.showExportData = function(){
		var result=false;
		if($scope.selectedItem){
			var id = $scope.selectedItem.id;
			angular.forEach($scope.acl,function(item){
				if(item.roleId==5 && (item.query==id || item.query=='*')){
					result=true;
				}
			});
		}
		return result;
	};

	$scope.showExportDeIdentifiedData = function(){
		var result=false;
		if($scope.selectedItem){
			var id = $scope.selectedItem.id;
			angular.forEach($scope.acl,function(item){
				if(item.roleId==6 && (item.query==id || item.query=='*')){
					result=true;
				}
			});
		}
		return result;
	};

	$scope.canExportData=function(){
		return $scope.selectedItem!=null;
	};

	$scope.canExportDataDictionary=function(){
		return $scope.selectedItem!=null;
	};

	$scope.canExportDeIdentifiedData=function(){
		return $scope.selectedItem!=null;
	};

	$scope.exportDataDictionaryLink=function(){
		var result = null;
		if($scope.selectedItem){
			result =DataService.getPath('dataDictionary/'+$scope.selectedItem.id);
		}
		return result;
	};

	$scope.exportDataLink=function(){
		var result = null;
		if($scope.selectedItem){
			result =DataService.getPath('dataExport/'+$scope.selectedItem.id);
		}
		return result;
	};

	$scope.exportDeIdentifiedDataLink=function(){
		var result = null;
		if($scope.selectedItem){
			result =DataService.getPath('deIdentifiedDataExport/'+$scope.selectedItem.id);
		}
		return result;
	};

	$scope.refreshRows=function(){
		$scope.processing=true;
		DataService.post('data/StudyDef/search',{searchContext:'StudyDashboard'}).then(function(result){
			var summary = result.data;
			$scope.processing=false;
			$scope.gridData=summary.items;
			angular.forEach(summary.items,function(item){
				var organizationID = MetadataService.findWithAttr($scope.organizations, 'id', item.organizationSummary.id);
				if (organizationID == undefined) {
					var organization = item.organizationSummary;
					organization.studies = [];
					organization.studies.push(item);
					$scope.organizations.push(organization);
				} else {
					$scope.organizations[organizationID].studies.push(item);
				}
			});
		}, function(data, status, headers, config) {
			console.log('error %o',arguments);
		});
	};

	$scope.refreshACL=function(){
		DataService.post('data/AccessControlList/view',{tableName:'STUDY_DEF'}).then(function(result) {
			$scope.acl=result.data.items;
		}, function(data, status, headers, config) {
			console.log('error %o',arguments);
		});
	};

	$scope.refreshRows();
	$scope.refreshACL();
}]);