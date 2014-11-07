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
        return new Date(date.replace('T', ' ').replace("-", "/"));
      },
      _oldestDate: function() {
        var _this = this;
        return _.sortBy(Object.keys($rootScope.dates), function(d) { return new Date(_this._friendlyDate(d)); })[0];
      },
      _allShowsSortedByDate: function() {
        var shows = [], today;
                
        _.each(Object.keys($rootScope.dates), function(date) {
          today = $rootScope.dates[date].onToday;
          shows = shows.concat(today);
        });
        
        console.log(shows)
        var sorted = _.sortBy(shows, function(show) { return new Date(show.start_utc); }).reverse();
        var combined = [];
        
        for(var i = 0; i < sorted.length; i ++) {
          if (sorted[i+1] && sorted[i].program_id === sorted[i+1].program_id) {
            // adjacent shows
            var playlist = sorted[i].playlist

            if (sorted[i+1].playlist) {
              sorted[i+1].playlist.concat(playlist);
            }
            else {
              sorted[i+1].playlist = playlist
            }
            sorted[i+1].end = sorted[i].end;
            
          }
          else {
            combined.push(sorted[i]);
          }
        }
        
        return combined;
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
        console.log("load more items = " + itemCount);
        
        if (!$rootScope.dates) return;
        var shows = this._allShowsSortedByDate();
        var nowIndex = this._nowIndex($rootScope.onNow, shows)
       
        if (!itemCount) itemCount = 0;

        if (!$rootScope.pagedShows) {
          $rootScope.pagedShows = shows.slice(nowIndex, nowIndex + 3);
          return;
        }
        
        var currentShows = shows.slice(nowIndex, nowIndex + $rootScope.pagedShows.length + itemCount);
          
        // Let's try not to touch the pagedShows object too much so it doesn't refresh everything.
          
        for (var i = 0; i < currentShows.length; i++) {
          console.log("checking show " + i + " / " + currentShows.length);
          if (($rootScope.pagedShows[i]) && (currentShows[i].start_utc == $rootScope.pagedShows[i].start_utc)) {
            
            var currentPlaylist = currentShows[i].playlist;
            var visiblePlaylist = $rootScope.pagedShows[i].playlist;
            // check if tracks are the same
            if (currentPlaylist && currentPlaylist.length != visiblePlaylist.length)
              for (var j = 0; j < currentPlaylist.length; j++) {
                console.log("checking playlist " + j + " / " + currentShows.length)
                
                if (!visiblePlaylist[j] && currentPlaylist[j]) {
                  visiblePlaylist.splice(j, 0, currentPlaylist[j]);
                }
              }
            }
            else {
              $rootScope.pagedShows.splice(i, 0, currentShows[i]);
            }
        }
        
        if (currentShows.length - $rootScope.pagedShows.length < 2 && itemCount > 0) {
          var _this = this;
          this.fetchByDate(this.yesterday(this._oldestDate())); //.then( function(response) { _this.loadMoreItems(3) } );
        }
      },
      fetchItems: function(loadList) {
        var _this = this;
        var promise = $http.get('https://api.composer.nprstations.org/v1/widget/50ef24ebe1c8a1369593d032/now?format=json')
        
        promise.success(function(result) {
            $rootScope.onNow = result.onNow;
            $rootScope.nextUp = result.nextUp;
            _this.fetchByDate(result.onNow.date, loadList);
        });
        
        return promise;
      },
      fetchByDate: function(date, loadList) {
        console.log("fetching date " + date);
        var _this = this;
        return $http.get("https://api.composer.nprstations.org/v1/widget/50ef24ebe1c8a1369593d032/day?date=" + date + "&format=json").success(function(dateResult) {
          if (!$rootScope.dates) $rootScope.dates = {};
          $rootScope.dates[date] = dateResult;
          
          if (loadList) _this.loadMoreItems();
        });
      },
      yesterday: function(date) {
        return new Date(new Date(date) - (24 * 60 * 60 * 100)).toJSON().slice(0,10);
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
