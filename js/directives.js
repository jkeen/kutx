'use strict';

/* Directives */


angular.module('kutPlayer.directives', []).
  directive('appVersion', ['version', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  // .directive("openExternal", ['$window', function ($window) {
  //   return{
  //     restrict: 'A',
  //     scope: {
  //       exit: "&",
  //       loadStart: "&",
  //       loadStop: "&",
  //       loadError: "&"
  //     },
  //     controller: function ($scope, $element, $attrs) {
  //       inAppBrowser = $window.open($attrs.href, '_blank', 'location=yes');
  //       if ($scope.exit instanceof Function) {
  //         inAppBrowser.addEventListener('exit', wrappedFunction($scope.exit));
  //       }
  //     }
  //   };
  // }])
  .directive('notificationConsole', ['$timeout', function($timeout) {
    return {
      link: function(scope, element, attrs) {
        scope.$watch('notification', function(new_value, old_value) {
          if (new_value) {
            scope.showNotification = true;
            $timeout(function () {
              scope.showNotification = false;
            }, 8000);
          }
        });
      }
    };
  }])
  .directive('playPause', [function() {
    return {
      link: function(scope, element, attrs) {
        scope.$watch('player.waiting', function(waiting) {
          if (waiting)
            element.addClass('loading');
          else
            element.removeClass('loading');
        });

        scope.$watch('player.playing', function(playing) {
          if (playing)
            element.removeClass('play').addClass('pause').html("Pause");
          else
            element.removeClass('pause').addClass('play').html("Listen");
        });
      }
    };
  }]);
