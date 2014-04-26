/*global angular, random, move */
var nuPressButton = angular.module('nu.PressButton', ['nu.Event']);

nuPressButton.directive('nuPressButton', ['nuEvent', '$parse',
  function(nuEvent, $parse) {
    'use strict';
    var _template =
    '<div class="nu button press">' +
      '<input class="src" type="checkbox" autocomplete="off" style="display:none;">' +
      '<label icon="Off"></label>' +
      '<label icon="On"></label>' +
    '</div>';

    return {
      template: _template,
      restrict: 'EACM',
      replace: true,
      require: '?ngModel',
      priority: 5,
      link: function(scope, element, attrs, ngModel) {
        var icon = attrs.nuPressButton || attrs.icon,
            label = element.find('label');

        angular.element(label[1]).attr('class',
          (icon? icon : '') + (attrs.on? ' ' + attrs.on : ''));

        angular.element(label[0]).attr('class',
          (icon? icon : '') + (attrs.off? ' ' + attrs.off : ''));

        initTwoStateSwtich(scope, element, attrs, ngModel,
          nuEvent(scope, attrs), $parse(attrs.ngModel)(scope));
      }
    };
  }

  // TODO: Test Events
]);