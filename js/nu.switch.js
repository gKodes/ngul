/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular) {
'use strict';
/*global angular: true*/
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
          } else { id = randomId(); }

          attr($element.find('input'), $element, ['name', 'checked']).attr('id', id);
          $element.find('label').attr('for', id);

          var link = function(scope, element, attrs, ngModel) {
            var labelOn = true, labelOff = false;

            attrs.$observe('on', function (value) {
              labelOn = scope.labelOn = value;
            });

            attrs.$observe('off', function (value) {
              labelOff = scope.labelOff = value;
            });

            if( ngModel ) {
              var input = element.find('input');
              ngModel.$render = function() {
                input.checked = (labelOn === ngModel.$viewValue || 
                  (!labelOn & ngModel.$viewValue));
              };

              input.on('change', function() {
                var input = this;
                scope.$apply(function(){
                  if (angular.isDefined(attrs.on) && angular.isDefined(attrs.off)) {
                    ngModel.$setViewValue(input.checked ? attrs.on : attrs.off);
                  } else { ngModel.$setViewValue(input.checked); }
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
