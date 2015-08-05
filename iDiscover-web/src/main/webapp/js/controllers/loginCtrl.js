myApp.controller('LoginCtrl', ['$scope','$rootScope','$location','$state','UserService','$cookies','DataService','ThemeService','$http','$rootScope','$modal',
	function ($scope,$rootScope,$location,$state,UserService,$cookies,DataService,ThemeService,$http,$rootScope,$modal) {

	$scope.user = UserService;
	$scope.enrollmentIds = [1,10,12,14,15,16];
	$scope.authorIds= [2,5,7,13];
	$scope.adminIds= [6,8,9,11,17];

	$scope.enrollmentMenu = [];
	$scope.authorMenu= [];
	$scope.adminMenu = [];

	$scope.pendingMenuIcon=ThemeService.pendingMenuIcon;
	$scope.enrollmentMenuIcon=ThemeService.enrollmentMenuIcon;
	$scope.adminMenuIcon=ThemeService.adminMenuIcon;
	$scope.authorMenuIcon=ThemeService.authorMenuIcon;
	$scope.iPadMenuIcon=ThemeService.iPadMenuIcon;
    $scope.profileIcon=ThemeService.profileIcon;
    $scope.helpIcon=ThemeService.helpIcon;

	$scope.loadingText=function(){
		if($rootScope.currDialog==null){
			return "Loading...";
		}else{
			return "Waiting...";
		}
	};

	$scope.gotoState = function(s){
		$state.transitionTo(s);
	};

	// on click logout
	$scope.logout = function () {
		UserService.logout();
		$http.get('/pkmslogout').
			success(function(data, status, headers, config) {
				window.location='logout';
			}).
			error(function(data, status, headers, config) {
				window.location='logout';
			});

	};

	$scope.openSettings=function(){
		$rootScope.isNavigating=true;
		DataService.post('data/Users/view',{id:$scope.userId}).then(
			function (newItem) {
				$scope.processing = false;
				var tempUser = newItem.data.item;
				var d = $modal.open({
					templateUrl:'../partials/editUsers.html',
					controller:'EditUsersCtrl',
					backdropClick: false,
					resolve: {itemToEdit:function(){return tempUser;}}
				});

				$rootScope.currDialog=d;
				d.result.then(function (result) {
					$rootScope.isNavigating=false;
					$rootScope.currDialog=null;
				});
			},
			function (error) {
				$rootScope.isNavigating=false;
				$rootScope.currDialog=null;
			}
		);
	};

	DataService.get('currentUser').then(function(result){
		$scope.userId=result.data.username;
        UserService.userId=$scope.userId;

	},function(data, status, headers, config){
		console.log('error %o',arguments);
	});

	DataService.post('data/Screen/search',{}).then(function(result){
		angular.forEach(result.data.items,function(menuItem){
			if($scope.enrollmentIds.indexOf(menuItem.id)>-1){
				$scope.enrollmentMenu.push(menuItem);
			}else if($scope.authorIds.indexOf(menuItem.id) >-1){
				$scope.authorMenu.push(menuItem);
			}else if($scope.adminIds.indexOf(menuItem.id)>-1){
				$scope.adminMenu.push(menuItem);
			}
		});




	},function(data, status, headers, config){
		console.log('error %o',arguments);
	});
}]);