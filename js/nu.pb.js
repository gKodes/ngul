/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular, nu) {
  'use strict';
  /*global angular, nu: true*/

  var pb = angular.module('nu.pb', []);

  pb.directive('nuPressButton', [
    function() {
      var _template =
      '<div class="nu button press">' +
        '<input class="src" type="radio" autocomplete="off" style="display:none;">' + // ng-model=""
        '<label class="icon {{icon}} {{state}}"></label>' + //nu-switch
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
          var label = $element.find('label');
          label.attr('for', id);

          var link = function(scope, element, attrs, ngModel) {
            var iconOn = null, iconOff = null, labelOn = true, labelOff = false;

            attrs.$observe('on', function (value) { labelOn = value; });
            attrs.$observe('off', function (value) { labelOff = value; });
            attrs.$observe('icon', function (value) { scope.icon = value; });
            attrs.$observe('iconOn', function (value) { iconOn = value; });
            attrs.$observe('iconOff', function (value) { iconOff = value; });

            var input = element.find('input');
            if( ngModel ) {
              ngModel.$render = function() {
                input[0].checked = (labelOn === ngModel.$viewValue ||
                  (!labelOn && ngModel.$viewValue === true));
                scope.state = (input.checked && iconOn)? iconOn : iconOff;
              };

              input.on('change', function() {
                var input = this;
                scope.$apply(function() {
                  var isChecked = input.checked;
                  ngModel.$setViewValue(
                    nu['switch'](isChecked, attrs.on, attrs.off));
                  scope.state = (isChecked && iconOn)? iconOn : iconOff;
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