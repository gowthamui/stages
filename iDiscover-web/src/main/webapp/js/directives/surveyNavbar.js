myApp.directive('surveyNavbar', ['$filter','$rootScope','$log','ThemeService','UserService','DataService','$state', function($filter,$rootScope,$log,ThemeService,UserService,DataService,$state) {
        return {
            restrict: 'A',
            replace: true,
            terminal:true,
            templateUrl: '../partials/surveyNavbar.html',
            scope:{

            },
            controller: function ($scope) {
                $scope.user = UserService;
                $scope.pendingMenuIcon=ThemeService.pendingMenuIcon;

                $scope.goHome=function(){
                    $state.transitionTo('home');
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

                DataService.get('currentUser').then(function(result){
                    $scope.userId=result.data.username;
                    UserService.userId=$scope.userId;

                },function(data, status, headers, config){
                    console.log('error %o',arguments);
                });

            }
        };
    }]);