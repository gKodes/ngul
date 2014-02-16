/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular, nu) {
  'use strict';
  /*global angular, nu: true*/

  var nswitch = angular.module('nu.switch', []);

  nswitch.directive('nuSwitch', [
    function() {
      var _template =
      '<div class="nu switch">' +
        '<input class="src" type="checkbox" autocomplete="off">' + // ng-model=""
        '<label class="label" switch-off="{{labelOff}}" ng-bind="labelOn"></label>' + //nu-switch
      '</div>';

      return {
        template: _template,
        restrict: 'EACM',
        replace: true,
        require: '?ngModel',
        scope: {},
        compile: function compile($element, $attrs) {
          var id = $attrs.id;

          if (id) {
            $element.removeAttr('id');
          } else { id = nu.random.id(); }

          nu.attr.move($element.find('input'), $element, ['name', 'checked']).attr('id', id);
          $element.find('label').attr('for', id);

          var link = function(scope, element, attrs, ngModel) {
            var labelOn, labelOff;

            attrs.$observe('on', function (value) {
              labelOn = value;
              scope.labelOn = value? value : 'On';
            });

            attrs.$observe('off', function (value) {
              labelOff = value;
              scope.labelOff = value? value : 'Off';
            });

            if( ngModel ) {
              var input = element.find('input');
              ngModel.$render = function() {
                input[0].checked = (labelOn === ngModel.$viewValue ||
                  (!labelOn && ngModel.$viewValue === true));
              };

              input.on('change', function() {
                var isChecked = this.checked;
                scope.$apply(function() {
                  ngModel.$setViewValue(
                    nu['switch'](isChecked, labelOn, labelOff));
                });
              });

              if(angular.isDefined(scope.$parent[attrs.ngModel])) {
                ngModel.$viewValue = scope.$parent[attrs.ngModel];
                ngModel.$render();
              }
              ngModel.$setViewValue(
                nu['switch'](input[0].checked, attrs.on, attrs.off));
            }
          };

          return link;
        }
      };
    }
  ]);

})(angular, nu);

function createEvent(name) {
  var event = document.createEvent('Event')
  event.initEvent(name, true, true);
  return event;
}