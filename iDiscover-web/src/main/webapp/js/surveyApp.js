'use strict';

// declare top-level module which depends on filters,and services
var myApp = angular.module('myApp', ['ui.utils', 'ui.bootstrap', 'ui.router', 'ngCookies', 'ngSanitize']);

// bootstrap (pre instance)
myApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('home', {
        url:'/home',
        templateUrl: '../partials/surveyHome.html',
        controller:'SurveyHomeCtrl'
    });

    $stateProvider.state('form', {
        url:'/form/{studyDefFormDefId}/{link}',
        templateUrl: '../partials/surveyForm.html',
        controller:'SurveyFormCtrl'
    });


    $urlRouterProvider
        .otherwise('/home');


}]);

// once app is instantiated
myApp.run(['$state', 'ConfigService', function ($state, ConfigService) {
    document.title=ConfigService.navbarTitle;
}]);