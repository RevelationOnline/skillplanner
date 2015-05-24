'use strict';

/**
 * @ngdoc overview
 * @name skillplannerApp
 * @description
 * # skillplannerApp
 *
 * Main module of the application.
 */
angular
  .module('skillplannerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'ui.grid'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        reloadOnSearch:false
      })
      .otherwise({
        redirectTo: '/'
      });
  });
