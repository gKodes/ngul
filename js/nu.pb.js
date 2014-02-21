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
        '<input class="src" type="checkbox" autocomplete="off" style="display:none;">' +
        '<label icon="Off"></label>' +
        '<label icon="On"></label>' +
      '</div>';

      return {
        template: _template,
        restrict: 'EACM',
        replace: true,
        require: '?ngModel',
        compile: function compile($element, $attrs) {
          var id = $attrs.id;
          var $input = $element.find('input');
          var $label = $element.find('label');

          if (id) {
            $element.removeAttr('id');
          } else { id = nu.random.id(); }

          nu.attr.move($input, $element, ['type', 'name', 'checked']).attr('id', id);
          $label.attr('for', id);

          var link = function(scope, element, attrs, ngModel) {
            attrs.$observe('iconOn', function(value) {
              angular.element($label[0]).attr('class',
                (attrs.icon? attrs.icon : '') + (value? ' ' + value : ''));
            });
            attrs.$observe('iconOff', function(value) {
              angular.element($label[1]).attr('class',
                (attrs.icon? attrs.icon : '') + (value? ' ' + value : ''));
            });

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
                var isChecked = this.checked;
                event.stopPropagation();
                if( this.type !== 'radio' || isChecked ) {
                  scope.$apply(function() {
                    ngModel.$setViewValue(isChecked);
                  });
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