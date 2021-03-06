/*global angular, forEach, isString, startsWith */

var nuEvent = angular.module('nu.Event', []);

nuEvent.service('nuEvent', ['$parse', function($parse) {
  'use strict';
  var nuPartialEvent = function(fn, $scope) {
    return function nuPartialEvent(event) {
      fn($scope, {'$event': event});
      $scope.$digest();
    };
  };

  var nuEventCreator = function(scope, attrs, events) {
    var NuEventController = function($scope, $attrs, $events) {
      $events = $events || 'change click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste ';
      NuEventManager.call(this);
      forEach($attrs, function(value, name) {
        if( isString(name) ) {
          if( startsWith(name, 'nu') ) {
            var eventName = name.substr(2).toLowerCase();
            if($events.indexOf(eventName + ' ') !== -1) {
              this.on(eventName, nuPartialEvent($parse(value), $scope));
            }
          }
        }
      }, this);
    };

    extend(NuEventController.prototype, NuEventManager.prototype);

    return new NuEventController(scope, attrs);
  };

  return nuEventCreator;
}]);