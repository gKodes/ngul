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
        '<label class="label"></label>' + //nu-switch
      '</div>';

      return {
        template: _template,
        restrict: 'EACM',
        replace: true,
        require: '?ngModel',
        //scope: true,
        compile: function compile($element, $attrs) {
          var id = $attrs.id;
          var $input = $element.find('input');
          var $label = $element.find('label');

          if (id) {
            $element.removeAttr('id');
          } else { id = nu.random.id(); }

          nu.attr.move($input, $element, ['type', 'name', 'checked']).attr('id', id);
          $label.attr('for', id);

          $attrs.$observe('on', function (value) {
            $label.text(value? value : 'On');
          });

          $attrs.$observe('off', function (value) {
            $label.attr('label-off', value? value : 'Off');
          });

          var link = function(scope, element, attrs, ngModel) {

            if( ngModel ) {

              ngModel.$formatters.push(function(value) {
                return ( (angular.isDefined(attrs.value) &&
                  value === attrs.value) || value === true);
              });

              ngModel.$parsers.push(function(value) {
                if(attrs.value) {
                  return value ? attrs.value : attrs.valueOff;
                }
                return value;
              });

              ngModel.$isEmpty = function(value) {
                return value !== attrs.value; // this.type !== 'radio'
              };

              ngModel.$render = function() {
                $input[0].checked = ngModel.$viewValue;
              };

              $input.on('change', function(event) {
                event.stopPropagation();
                var isChecked = this.checked;
                if( this.type !== 'radio' || isChecked ) {
                  ngModel.$setViewValue(isChecked);
                  scope.$digest();
                }
              });

              if(angular.isDefined(scope[attrs.ngModel])) {
                ngModel.$setViewValue(scope[attrs.ngModel]);
              } else if($input[0].defaultChecked) { ngModel.$setViewValue($input[0].checked); }
            }
          };

          return link;
        }
      };
    }
  ]);

})(angular, nu);