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

  var nuEventCreator = function(scope, attrs) {
    var NuEventController = function($scope, $attrs) {
      NuEventManager.call(this);
      forEach($attrs, function(value, name) {
        if( isString(name) ) {
          if( startsWith(name, 'nu') ) {
            this.on(name.substr(2).toLowerCase(), nuPartialEvent($parse(value), $scope));
          }
        }
      }, this);
    };

    extend(NuEventController.prototype, NuEventManager.prototype);

    return new NuEventController(scope, attrs);
  };

  return nuEventCreator;
}]);