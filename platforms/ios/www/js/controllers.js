'use strict';

/* Controllers */

angular.module('kutPlayer.controllers', []).
  controller('SplashScreenCtrl', ['$scope', '$timeout', '$location', 'splashscreenService', function ($scope, $timeout, $location, splashscreenService) {
    $scope.$on('$viewContentLoaded', function () {
      $timeout(function () {
        splashscreenService.hide();
        $location.path('/player');
      }, 1000);
    });
  }])
  
  .controller('PlaylistCtrl', ['$scope', '$timeout', 'playlistService', function($scope, $timeout, playlistService) {
    $scope.playlist = playlistService;
    $scope.onScroll = function() {
       _.bind(playlistService.loadMoreItems, playlistService)(3)
    }
    
    $scope.fetchAndLoad = function() {
      console.log('hello from fetch and load')
      $scope.playlist.fetchItems(true).then(function load(status) {
        $timeout($scope.fetchAndLoad, 10000);
        $scope.playlist.loadMoreItems(0);
      });
    }
    
    $scope.fetchAndLoad();
    
    // var _this = this;
    // $scope.intervalFunction = function(){
    //   $timeout(fetchAndLoad, 10000);
    // };
    // 
    

    
    // Function to replicate setInterval using $timeout service.

    document.addEventListener("resume", function() {
      $timeout.flush();
      $scope.fetchAndLoad(); 
    });
    
  }])
  
  .controller('NavBarCtrl', ['$scope', function($scope) {
    $scope.isCollapsed = true;
  }])
  
  .controller('PlayerCtrl', ['$scope', '$http', '$templateCache', '$timeout', 'notificationService', 'audioService', function ($scope, $http, $templateCache, $timeout, notificationService, audioService) {
    $scope.canplay = false;
    $scope.player = audioService;

    $scope.method = 'JSONP';
    $scope.url = 'http://kutkutx.appspot.com/stream?callback=JSON_CALLBACK';

    $scope.sourceFetch = function() {
      $http({method: $scope.method, url: $scope.url, cache: $templateCache}).
        success(function(data, status) {
          $scope.source = "http://pubint.ic.llnwd.net/stream/pubint_kut2"; //data.source;
        }).
        error(function(data, status, headers, config) {
          $scope.source = 'http://pubint.ic.llnwd.net/stream/pubint_kut2';
        });
    }
    $scope.sourceFetch();

    $scope.online = navigator.onLine;
    document.addEventListener('offline', function () {
      $scope.$apply(function() {
        $scope.online = false;
      });
    }, false);
    document.addEventListener('online', function () {
      $scope.$apply(function() {
        $scope.online = true;
      });
    }, false);


    $scope.playPause = function() {
      if (!$scope.player.hasplayed) {
        $scope.player.load($scope.source);
        $scope.player.play();
        $scope.player.hasplayed = true;
      }
      $scope.player.playPause();
    }

    $scope.player.on('play', function () {
      console.log('play');
      $scope.$apply();
    });
    
    $scope.player.on('canplay', function () {
      console.log('canplay');
      $scope.$apply(function() {
        $scope.canplay = true;
      });
    });
    $scope.player.on('pause', function () {
      console.log('pause');
      $scope.$apply();
    });
    $scope.player.on('waiting', function () {
      console.log('waiting');
      $scope.$apply();
    });
    $scope.player.on('playing', function () {
      console.log('playing');
      $scope.$apply();
    });
    $scope.player.on('ended', function () {
      console.log('ended');

      if ($scope.online) {
        $scope.notification = 'Playback ended. Reconnecting to stream.';
        notificationService.alert('Playback has been stopped. Retrying...', 'Connection problems', 'Okey', null);

        // $scope.player.load($scope.source);
        // $scope.player.play();
      } else {
        notificationService.alert('Playback has been stopped. Please retry.', 'Connection problems', 'Okey', null);
  
        $scope.canplay = false;
      }
      $scope.$apply();
    });
    $scope.player.on('error', function (error) {
      if ($scope.online) {
        // $scope.player.load($scope.source);
      } else {
        $scope.canplay = false;
      }
      $scope.$apply();
    });

    $scope.$watch('online', function (new_value, old_value) {
      if (new_value) {
        console.log('online');
        if (!old_value && !$scope.player.playing) {
          console.log('was offline and not playing, loading audio');

          $scope.notification = 'Device online. Reconnecting to stream.';

          $scope.player.load($scope.source);
          $scope.player.play();
        }
      } else {
        console.log('offline');

        $scope.notification = 'Device not connected to internet.';
        //notificationService.alert('Device not connected to network. Streaming is not possible.', 'Connection problems', 'Okey', null);

        if (!$scope.player.playing) {
          $scope.canplay = false;
        }
      }
    });
    $scope.$watch('source', function (new_value, old_value) {
      if (new_value) {
        console.log('source: '+new_value);
        // $scope.player.load(new_value);
        $scope.canplay = true;
      }
    });
  }]);
  
  // Hack to open links in external web browser instead of flaky internal one
  $(document).on('click','a[rel=external]', function(e) {
     e.preventDefault();
     e.stopPropagation();
     var elem = $(this);
     var url = elem.attr('href');
     if (url.indexOf('http://') !== -1) {
         window.open(url, '_system');
     }
     return false;
 });