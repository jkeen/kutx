'use strict';

/* Filters */

angular.module('kutPlayer.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('reverse', function() {
    return function(items) {
      if (!items) return [];
      return items.slice().reverse();
    };
  }).
  filter('initials', function() {
    return function(name) {
      return name.replace("The ", "").slice(0,1);
    };
  }).
  filter('showBannerUrl', function() {
    return function(show) {
      var hostImages = {
        "Paul Ray"    : "paulray.jpg",
        "John Aielli" : "johnaielli.jpg",
        "Laurie Gallardo": "lauriegallardo.jpg",
        "Jay Trachtenberg": "jaytrachtenberg.jpg"
      }
      
      var bannerImage;
      
      switch(show.program_id) {
      case "50ef24f0e1c8a1369593d04b":  //  Conversations WC
        bannerImage = "img/banners/radio.jpg";
        break;
      case "50ef24eee1c8a1369593d037":  //  Across the Water with Ed Miller
        bannerImage = "img/banners/guitarfingers.jpg";
        break;
      case "50ef24f0e1c8a1369593d048":  //  Art Levy
        bannerImage = "img/banners/radio.jpg";
        break;
      case "50ef24efe1c8a1369593d03e":  //  Audrey Morton
        break;
      case "523c5fb9a392b2d97000029c":  //  Austin Music Experience
        bannerImage = "img/banners/austin1970s.jpg"
        break;
      case "50ef24efe1c8a1369593d038":  //  Eklektikos with Jody Denberg
        bannerImage = "img/banners/mirror.jpg";
        break;
      case "50ef24f0e1c8a1369593d046":  //  Eklektikos with John Aielli
        bannerImage = "img/hosts/johnaielli.jpg";
        break;
      case "50ef24efe1c8a1369593d039":  //  Folkways
        bannerImage = "img/banners/notes.jpg";
        break;
      case "50ef24eee1c8a1369593d035":  //  Global Grooves with Michael Crockett
        bannerImage = "img/banners/notes.jpg";
        break;
      case "50ef24efe1c8a1369593d03f":  //  Horizontes
        bannerImage = "img/banners/notes.jpg";
        break;
      case "50ef24efe1c8a1369593d040":  //  Jay Trachtenberg
        bannerImage = "img/hosts/jaytrachtenberg.jpg";
        break;
      case "50ef24f0e1c8a1369593d04a":  //  Jazz with Jay Trachtenberg
        bannerImage = "img/hosts/jaytrachtenberg.jpg";
        break;
      case "50ef24efe1c8a1369593d041":  //  Jody Denberg
        break;
      case "50ef24efe1c8a1369593d03c":  //  John Parsons
        break;
      case "50ef24f0e1c8a1369593d051":  //  Kevin Connor
        bannerImage = "img/banners/austin1970s.jpg";
        break;
      case "50ef24efe1c8a1369593d043":  //  KUTX Music Mix
        bannerImage = "img/banners/antones.jpg";
        break;
      case "5217765eab64de9d5f000001":  //  KUTX Music Mix
        bannerImage = "img/banners/antones.jpg";
        break;
      case "50ef24efe1c8a1369593d03d":  //  Left of the Dial
        bannerImage = "img/banners/radio.jpg";
        break;
      case "50ef24eee1c8a1369593d033":  //  Matt Reilly
        bannerImage = "img/banners/austin1970s.jpg";
        break;
      case "50ef24f0e1c8a1369593d04f":  //  Music Specials
        bannerImage = "img/banners/tubas.jpg";
        break;
      case "51dc48acf0086c39430001f3":  //  Old School Dance Party w/ John E. Dee
        bannerImage = "img/banners/awhq.jpg";
        break;
      case "50ef24f0e1c8a1369593d04d":  //  Rick McNulty
        break;
      case "50ef24efe1c8a1369593d03a":  //  Sound Opinions
        bannerImage = "img/banners/soundboard.jpg";
        break;
      case "50ef24efe1c8a1369593d045":  //  Susan Castle
        bannerImage = "img/hosts/susancastle.jpg";
        break;
      case "50ef24f0e1c8a1369593d049":  //  The KUTX Sunday Mix with Jody Denberg
        break;
      case "50ef24efe1c8a1369593d03b":  //  The Laurie Show
        bannerImage = "img/hosts/lauriegallardo.jpg";
        break;
      case "50ef24f0e1c8a1369593d050":  //  Trina Quinn
        break;
      case "50ef24f0e1c8a1369593d04e":  //  Twine Time with Paul Ray
        bannerImage = "img/hosts/paulray.jpg";
        break;
      case "50ef24efe1c8a1369593d042":  //  Undercurrents
        break;
      case "50ef24efe1c8a1369593d044":  //  World Cafe
        break;
      case "50ef24eee1c8a1369593d036":  //  World Music with Hayes McCauley
        break;
      }
      
      if (bannerImage) return bannerImage;
      
      return ("img/banners/shelf.png");
    }
  })
  
  // from angular moment
	.value('amTimeAgoConfig', { withoutSuffix: false})
	.directive('amTimeAgo', ['$window', 'amTimeAgoConfig', function ($window, amTimeAgoConfig) {
		'use strict';

		return function (scope, element, attr) {
			var activeTimeout = null;
			var currentValue;
			var currentFormat;
			var withoutSuffix = amTimeAgoConfig.withoutSuffix;
			if (typeof attr.amWithoutSuffix !== 'undefined') {
				withoutSuffix = attr.amWithoutSuffix;
			}

			function cancelTimer() {
				if (activeTimeout) {
					$window.clearTimeout(activeTimeout);
					activeTimeout = null;
				}
			}

			function updateTime(momentInstance) {
				element.text(momentInstance.fromNow(withoutSuffix));
				var howOld = $window.moment().diff(momentInstance, 'minute');
				var secondsUntilUpdate = 3600;
				if (howOld < 1) {
					secondsUntilUpdate = 1;
				} else if (howOld < 60) {
					secondsUntilUpdate = 30;
				} else if (howOld < 180) {
					secondsUntilUpdate = 300;
				}

				activeTimeout = $window.setTimeout(function () {
					updateTime(momentInstance);
				}, secondsUntilUpdate * 1000);
			}

			function updateMoment() {
				cancelTimer();
				updateTime($window.moment(currentValue, currentFormat));
			}

			scope.$watch(attr.amTimeAgo, function (value) {
				if ((typeof value === 'undefined') || (value === null) || (value === '')) {
					cancelTimer();
					if (currentValue) {
						element.text('');
						currentValue = null;
					}
					return;
				}

				if (angular.isNumber(value)) {
					// Milliseconds since the epoch
					value = new Date(value);
				}
				// else assume the given value is already a date

				currentValue = Date.parse(value.replace(/-/g, '/'));
				updateMoment();
			});
			
			if (typeof attr.amWithoutSuffix !== 'undefined') {
				scope.$watch(attr.amWithoutSuffix, function (value) {
					if ((typeof value === 'undefined') || (value === null) || (typeof value !== 'boolean')) {
						return;
					}
				  withoutSuffix = value;
				  updateMoment();
				});
			}

			attr.$observe('amFormat', function (format) {
				currentFormat = format;
				if (currentValue) {
					updateMoment();
				}
			});

			scope.$on('$destroy', function () {
				cancelTimer();
			});
		};
	}])
	.filter('amCalendar', ['$window', function ($window) {
		'use strict';

		return function (value) {
			if (typeof value === 'undefined' || value === null) {
				return '';
			}

			if (!isNaN(parseFloat(value)) && isFinite(value)) {
				// Milliseconds since the epoch
				value = new Date(parseInt(value, 10));
			}
			// else assume the given value is already a date

			return $window.moment(value).calendar();
		};
	}])
	.filter('amDateFormat', ['$window', function ($window) {
		'use strict';

		return function (value, format) {
			if (typeof value === 'undefined' || value === null) {
				return '';
			}

			if (!isNaN(parseFloat(value)) && isFinite(value)) {
				// Milliseconds since the epoch
				value = new Date(parseInt(value, 10));
			}
			// else assume the given value is already a date
			return $window.moment(Date.parse(value.replace(/-/g, '/'))).format(format);
		};
	}])
	.filter('amDurationFormat', ['$window', function ($window) {
		'use strict';

		return function (value, format, suffix) {
			if (typeof value === 'undefined' || value === null) {
				return '';
			}

			// else assume the given value is already a duration in a format (miliseconds, etc)
			return $window.moment.duration(value, format).humanize(suffix);
		};
	}]);
