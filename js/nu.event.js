/*global angular*/
var Event = angular.module('nu.event', []);

Event.service('nuEvent', ['$parse', function($parse) {
  'use strict';
  var nuEventCreator = function(scope, attrs) {
    var NUEvent = function(scope, attrs) {
      var Event = {};
      angular.forEach(attrs, function(value, name) {
        if(angular.isString(name)) {
          var indexOfnu = name.indexOf('nu');
          if( indexOfnu === 0 ) {
            Event[name.substr(2).toLowerCase()] = $parse(value);
          }
        }
      });

      var trigger = this.trigger = function(name, event) {
        if(Event[name]) {
          Event[name](scope, {'$event': event});
        }
      };

      this.bind = function(element, name, transformationFn) {
        angular.forEach(name.split(' '), function(ename) {
          if(Event[ename] || transformationFn) {
            element.on(ename, function(event) {
              trigger(ename, (transformationFn || angular.identity).call(this, event));
            });
          }
        });
      };
    };

    return new NUEvent(scope, attrs);
  };

  return nuEventCreator;
}]);