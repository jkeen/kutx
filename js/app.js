'use strict';


// Declare app level module which depends on filters, and services
angular.module('kutPlayer', ['ngRoute', 'ngAnimate', 'kutPlayer.filters', 'kutPlayer.services', 'kutPlayer.directives', 'kutPlayer.controllers', 'ui.bootstrap']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/splash', {templateUrl: 'partials/splash.html', controller: 'SplashScreenCtrl'});
    $routeProvider.when('/player', {templateUrl: 'partials/player.html', controller: 'PlayerCtrl'});
    $routeProvider.otherwise({redirectTo: '/splash'});
  }]);
