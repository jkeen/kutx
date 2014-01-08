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
  .factory('playlistService', ['$rootScope', '$http', '$timeout', function($rootScope, $http, $timeout) {
    return {
      _friendlyDate: function(date) {
        //return new Date(date)
        return new Date(date.replace('T', ' ').replace("-", "/"))
      },
      _oldestDate: function() {
        return _.sortBy(Object.keys($rootScope.dates), function(d) { return new Date(d) })[0];
      },
      _allShowsSortedByDate: function() {
        var shows = []
        _.each(Object.keys($rootScope.dates), function(date) {
          shows = shows.concat($rootScope.dates[date].onToday)
        });
        
        return _.sortBy(shows, function(show) { return new Date(show.start_utc) }).reverse();
      },
      _nowIndex: function(nowPlaying, shows) {
        var index = 0;
        var foundIndex = -1;
        var _this = this;
        _.each(shows, function(show) {
          if (show.start_utc == nowPlaying.start_utc) { 
            foundIndex = index;
          }
          index = index + 1;
        });

        return foundIndex;
      },
      loadMoreItems: function(itemCount) {
        var shows = this._allShowsSortedByDate();
        var nowIndex = this._nowIndex($rootScope.onNow, shows)

        if (!itemCount) itemCount = 0;
        if (!$rootScope.pagedShows) $rootScope.pagedShows = shows.slice(nowIndex, nowIndex + 3)
        else {
          $rootScope.pagedShows = $rootScope.pagedShows = shows.slice(nowIndex, nowIndex + $rootScope.pagedShows.length + itemCount)
          
          if (shows.length - $rootScope.pagedShows.length < 2) {
            this.fetchByDate(this.yesterday(this._oldestDate())).then(this.loadMoreItems)
          }
        }
      },
      fetchItems: function() {
        var _this = this;
        var promise = $http.get('https://api.composer.nprstations.org/v1/widget/50ef24ebe1c8a1369593d032/now?format=json')
        
        promise.success(function(result) {
            $rootScope.onNow = result.onNow;
            $rootScope.nextUp = result.nextUp;
            $rootScope.dates = {}
            _this.fetchByDate(result.onNow.date);
        });
        
        return promise;
      },
      fetchByDate: function(date) {
        var _this = this;
        $http.get("https://api.composer.nprstations.org/v1/widget/50ef24ebe1c8a1369593d032/day?date=" + date + "&format=json").success(function(dateResult) {
          $rootScope.dates[date] = dateResult;
          _this.loadMoreItems();
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
