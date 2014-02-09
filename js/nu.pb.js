/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular) {
'use strict';
/*global angular: true, $script: true*/
  var randomId = function(options) {
    options = angular.extend({pool: '0123456789abcdefghiklmnopqrstuvwxyz', size: 8}, options);

    var randStr = '';
    for (var i = 0; i < options.size; i++) {
      randStr += options.pool[Math.floor(Math.random() * options.pool.length)];
    }
    return randStr;
  };

  var attr = function(dst, src, names) {
    for (var count = 2; count < names.length; count++) {
      dst.attr(names[count], src.attr(names[count]));
      src.removeAttr(names[count]);
    }
    return dst;
  };

  var nswitch = angular.module('nu.pb', []);

  nswitch.directive('nuPressButton', [
    function() {
      var _template =
      '<div class="nu button press">' +
        '<input class="src" type="checkbox" autocomplete="off" style="display:none;">' + // ng-model=""
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
          } else { id = randomId(); }

          attr($element.find('input'), $element, ['name', 'checked']).attr('id', id);
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
                input.checked = (labelOn === ngModel.$viewValue || 
                  (!labelOn & ngModel.$viewValue));
                scope.state = (input.checked && iconOn)? iconOn : iconOff;
              };

              input.on('change', function() {
                var input = this;
                scope.$apply(function() {
                  var isChecked = input.checked;
                  if (attrs.on && attrs.off) {
                    ngModel.$setViewValue(isChecked ? attrs.on : attrs.off);
                  } else { ngModel.$setViewValue(isChecked); }
                  scope.state = (isChecked && iconOn)? iconOn : iconOff;
                });
              });
            }
          };

          return link;
        }
      };
    }
  ]);

})(angular);

if (typeof($script) !== 'undefined' && typeof($script.done) === 'function') { $script.done('nu.switch'); }
