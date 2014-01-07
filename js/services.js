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
      addMoreItems: function(itemCount) {
        if (!itemCount) itemCount = 3;
        if (!$rootScope.pagedShows) $rootScope.pagedShows = $rootScope.shows.slice(0, itemCount)
        else {
          $rootScope.pagedShows = $rootScope.pagedShows = $rootScope.shows.slice(0, $rootScope.pagedShows.length + itemCount)
          
          if ($rootScope.shows.length - $rootScope.pagedShows.length < 2) {
            this.fetchByDate(this.yesterday($rootScope.lastDate))
          }
        }
        console.log($rootScope.pagedShows.length)
      },
      fetch: function() {
        var _this = this;
        $rootScope.shows = [];
        this.update();
      },
      update: function() {
        $http.get('https://api.composer.nprstations.org/v1/widget/50ef24ebe1c8a1369593d032/now?format=json')
         .success(function(result) {
            $rootScope.onNow = result.onNow;
            $rootScope.nextUp = result.nextUp;
            _this.fetchByDate(result.onNow.date); 
        })
      },
      // watch: function() {
      //   // Function to replicate setInterval using $timeout service.
      //    $rootScope.intervalFunction = function(){
      //      $timeout(function() {
      //        $rootScope.update();
      //        $rootScope.intervalFunction();
      //      }, 20000)
      //    };
      // 
      //    // Kick off the interval
      //    $rootScope.intervalFunction();
      // },
      fetchByDate: function(date) {
        function friendlyDate(date) {
          return new Date(date)
          return new Date(date.replace('T', ' ').replace("-", "/"))
        }
        
        
        var _this = this;
        $http.get("https://api.composer.nprstations.org/v1/widget/50ef24ebe1c8a1369593d032/day?date=" + date + "&format=json").success(function(dateResult) {
          var shows = [];
          var foundNow = false;
          
          // don't load shows in the future
          var nowUtc = friendlyDate($rootScope.onNow.start_utc);
          _.each(dateResult.onToday, function(show) {
            var showUtc = friendlyDate(show.start_utc);
            if (nowUtc >= showUtc) { 
              shows.push(show)
              console.log("yes: " + show.program.name)
            }
            else {
              console.log("not yet: " + show.program.name)
            }
          });
          $rootScope.lastDate = date;
          $rootScope.shows = $rootScope.shows.concat(shows.slice().reverse());
          
          if ($rootScope.shows.length < 4) _this.fetchByDate(_this.yesterday(date))
          _this.addMoreItems();
        });
      },
      yesterday: function(date) {
        return new Date(new Date(date) - (24 * 60 * 60 * 100)).toJSON().slice(0,10)
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
