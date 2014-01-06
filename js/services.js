'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('kutPlayer.services', []).
  value('version', '0.1')
  .factory('cordovaReady', [function () {
    return function (fn) {

      var queue = [];

      var impl = function () {
        queue.push(Array.prototype.slice.call(arguments));
      };

      document.addEventListener('deviceready', function () {
        queue.forEach(function (args) {
          fn.apply(this, args);
        });
        impl = fn;
      }, false);

      return function () {
        return impl.apply(this, arguments);
      };
    };
  }])
  .factory('splashscreenService', ['cordovaReady', function (cordovaReady) {
    return {
      show: cordovaReady(function () {
        navigator.splashscreen.show();
      }),
      hide: cordovaReady(function () {
        navigator.splashscreen.hide();
      })
    };
  }])
  .factory('notificationService', ['$rootScope', 'cordovaReady', function ($rootScope, cordovaReady) {
    return {
      alert: cordovaReady(function (message, title, buttonText, buttonAction) {
        navigator.notification.alert(message,
          $rootScope.$apply(function () {
            buttonAction();
          }),
          title,
          buttonText
        );
      })
    };
  }])
  .factory('playlistService', ['$rootScope', '$http', function($rootScope, $http) {
    return {
      fetch: function() {
        var _this = this;
        $rootScope.shows = [];
        $http.get('https://api.composer.nprstations.org/v1/widget/50ef24ebe1c8a1369593d032/now?format=json')
         .success(function(result) {
            $rootScope.currentShow = result.onNow.program.name;
            $rootScope.onNow = result.onNow;
            $rootScope.nextUp = result.nextUp;
            $rootScope.shows = [];
            
            _this.fetchByDate(result.onNow.date, function(dateResult) {
              var shows = [];
              var foundNow = false;
              _.each(dateResult.onToday, function(show) {
                if (!foundNow) shows.push(show);
                if (show._id == $rootScope.onNow._id) foundNow = true;
              })
              
              if (shows.length == 1) {
                  var yesterday = new Date(new Date(result.onNow.date) - (24 * 60 * 60 * 100)).toJSON().slice(0,10)
                
                 _this.fetchByDate(yesterday, function(r) {
                   $rootScope.shows = r.onToday.concat(shows);
                 })
              }
              else {
                $rootScope.shows = shows;
              }
            })
        })
      },
      fetchByDate: function(date, onSuccess) {
        $http.get("https://api.composer.nprstations.org/v1/widget/50ef24ebe1c8a1369593d032/day?date=" + date + "&format=json").success(onSuccess);
      }
    }
  }])
  .factory('audioService', function () {

    var params = {
      swf_path: '../lib/audio5js/swf/audio5js.swf',
      throw_errors: false,
      format_time: true
    };

    var audio5js = new Audio5js(params);

    return audio5js;
  });
