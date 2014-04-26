/*global angular, random, move, nu*/

var nuSwitch = angular.module('nu.Switch', ['nu.Event']);

nuSwitch.directive('nuSwitch', ['nuEvent', '$parse',
  function(nuEvent, $parse) {
    'use strict';
    var _template =
    '<div class="nu switch">' +
      '<input class="src" type="checkbox" autocomplete="off">' + // ng-model=""
      '<label class="label"></label>' + //nu-switch
    '</div>';

    return {
      template: _template,
      restrict: 'EACM',
      replace: true,
      require: '?ngModel',
      priority: 5,
      link: function(scope, element, attrs, ngModel) {
        var label = element.find('label');

        label.text(attrs.on? attrs.on : 'On');
        label.attr('label-off', attrs.off? attrs.off : 'Off');

        initTwoStateSwtich(scope, element, attrs, ngModel, 
          nuEvent(scope, attrs), $parse(attrs.ngModel)(scope));
      }
    };
  }
]);