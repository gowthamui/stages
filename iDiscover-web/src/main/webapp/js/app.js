'use strict';

// declare top-level module which depends on filters,and services
var myApp = angular.module('myApp', ['ngGrid', 'ui.utils', 'ui.bootstrap', 'ui.router', 'ngCookies', 'ngSanitize', 'highcharts-ng', 'ui.bootstrap.datetimepicker']);

// bootstrap (pre instance)
myApp.config(['$stateProvider', '$urlRouterProvider','$compileProvider', function ($stateProvider, $urlRouterProvider,$compileProvider) {

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript|data|blob):/);


	$urlRouterProvider
		.otherwise('/home');

	$stateProvider.state('home', {
		url:'/home',
		templateUrl: '../partials/home.html',
		controller:'HomeCtrl'
	});

    $stateProvider.state('studyForms', {
        url:'/studyForms',
        templateUrl: '../partials/studyForms.html',
        controller:'StudyFormsCtrl'
    });

    $stateProvider.state('screening', {
        url:'/screening',
        templateUrl: '../partials/screening.html',
        controller:'ScreeningCtrl'
    });

	$stateProvider.state('lookups', {
		url:'/lookups',
		templateUrl: '../partials/lookupGroups.html',
		controller:'LookupGroupsCtrl'
	});
	$stateProvider.state('organizations', {
		url:'/organizations',
		templateUrl: '../partials/organizations.html',
		controller:'OrganizationsCtrl'
	});
	$stateProvider.state('studyEnrollment', {
		url:'/studyEnrollment',
		templateUrl: '../partials/studyEnrollments.html',
		controller:'StudyEnrollmentsCtrl'
	});
	$stateProvider.state('studyEnrollmentDetail', {
		url:'/studyEnrollment/{studyDefId}/{studyEnrollmentId}/{studyDefFormDefId}/{participantId}',
		templateUrl: '../partials/formDetail.html',
		controller:'FormDetailCtrl'
	});
	$stateProvider.state('pending', {
		url:'/pending',
		templateUrl: '../partials/pending.html',
		controller:'PendingCtrl'
	});
	$stateProvider.state('studyDef', {
		url:'/studyDef',
		templateUrl: '../partials/studyDef.html',
		controller:'StudyDefCtrl'
	});
	$stateProvider.state('studyDefDetail', {
		url:'/studyDef/{studyDefId}',
		templateUrl: '../partials/studyDefDetail.html',
		controller:'StudyDefDetailCtrl'
	});
	$stateProvider.state('formDefDetail', {
		url:'/formDef/{formDefId}',
		templateUrl: '../partials/formDefDetail.html',
		controller:'FormDefDetailCtrl'
	});

	$stateProvider.state('modules', {
		url:'/modules',
		templateUrl: '../partials/modules.html',
		controller:'ModulesCtrl'
	});
	$stateProvider.state('users', {
		url:'/users',
		templateUrl: '../partials/users.html',
		controller:'UsersCtrl'
	});
	$stateProvider.state('groups', {
		url:'/groups',
		templateUrl: '../partials/groups.html',
		controller:'GroupsCtrl'
	});
	$stateProvider.state('roles', {
		url:'/roles',
		templateUrl: '../partials/roles.html',
		controller:'RolesCtrl'
	});
	$stateProvider.state('studyDefDashboard', {
		url:'/studyDefDashboard',
		templateUrl: '../partials/studyDefDashboard.html',
		controller:'StudyDefDashboardCtrl'
	});
	$stateProvider.state('schedule', {
		url:'/schedule',
		templateUrl: '../partials/schedule.html',
		controller:'ScheduleCtrl'
	});
    $stateProvider.state('importData', {
        url:'/importData',
        templateUrl: '../partials/importData.html',
        controller:'ImportDataCtrl'
    });
	$stateProvider.state('globalSearch', {
		url: '/globalSearch',
		templateUrl: '../partials/globalSearch.html',
		controller: 'GlobalSearchCtrl'
	});
    $stateProvider.state('dataBrowser', {
        url:'/dataBrowser',
        templateUrl: '../partials/browseData.html',
        controller:'BrowseDataCtrl'
    });
    $stateProvider.state('queryLibrary', {
        url:'/queryLibrary',
        templateUrl: '../partials/queryLibrary.html',
        controller:'QueryLibraryCtrl'
    });
}]);



myApp.factory('errorInterceptor', ['$q', '$rootScope',  '$window',
    function ($q, $rootScope, $window) {
        return {
            'response': function (response) {
                if(response && response.data && response.data.indexOf && (response.data.indexOf("TAM Junction")>-1 || response.data.indexOf("pkmslogin.form")>-1)){
                    $window.location.reload(true);
                }
                else if (response && response.status === 401) {
                    $window.location.reload(true);
                }
                return response;
            },
            'responseError': function (response) {
                if (response && response.status === 401) {
                    $window.location.reload(true);
                }
                return $q.reject(response);
            }
        };
    }]);

myApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('errorInterceptor');
}]);

// once app is instantiated
myApp.run(['$rootScope','$state','ConfigService',function ($rootScope,$state,ConfigService) {


	// register listener to watch route changes
	$rootScope.$on("$stateChangeStart", function(event, next, current) {
		if($rootScope.currDialog!=null){
			event.preventDefault();
		}else{
			$rootScope.isNavigating=true;
		}
	});

	$rootScope.$on("$stateChangeError", function(event, next, current) {
		$rootScope.isNavigating=false;
	});

	$rootScope.$on("$stateChangeSuccess", function(event, next, current) {
		$rootScope.isNavigating=false;
	});

	document.title=ConfigService.navbarTitle;

	$rootScope.keyPressGlobalSearch = function() {
		$state.go('globalSearch', null, {reload:true});
    };
}]);