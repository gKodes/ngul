/*global angular, random, attribute*/

var nswitch = angular.module('nu.switch', ['nu.event']);

nswitch.directive('nuSwitch', ['nuEvent',
  function(nuEvent) {
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
      //scope: true,
      link: function(scope, element, attrs, ngModel) {
        var id = attrs.id;
        var $input = element.find('input');
        var $label = element.find('label');
        var Event = nuEvent(scope, attrs);

        if (id) {
          element.removeAttr('id');
        } else { id = random.id(); }

        attribute.move($input, element, ['type', 'name', 'checked']).attr('id', id);
        $label.attr('for', id);

        attrs.$observe('on', function (value) {
          $label.text(value? value : 'On');
        });

        attrs.$observe('off', function (value) {
          $label.attr('label-off', value? value : 'Off');
        });

        attrs.$observe('disabled', function(value) {
          if( angular.isDefined(value) && value !== 'false' ) {
            $input.attr('disabled', value);
          } else { $input.removeAttr('disabled'); }
        });

        var formater = function(value) {
          return ( (angular.isDefined(attrs.value) &&
            value === attrs.value) || value === true);
        };

        var parser = function(value) {
          if(attrs.value) {
            return value ? attrs.value : attrs.valueOff;
          }
          return value;
        };

        if( ngModel ) {

          ngModel.$formatters.push(formater);
          ngModel.$parsers.push(parser);

          ngModel.$isEmpty = function(value) {
            return value !== attrs.value; // this.type !== 'radio'
          };

          ngModel.$render = function() {
            $input[0].checked = ngModel.$viewValue;
          };

          if(scope[attrs.ngModel] || $input[0].defaultChecked) {
            ngModel.$setViewValue( formater(scope[attrs.ngModel]) ||
              ($input[0].defaultChecked && $input[0].checked) );
            ngModel.$render();
          }
        }

        Event.bind($input, 'change', function(event) {
          var isChecked = this.checked;
          event.stopPropagation(); // 
          if( ngModel && (this.type !== 'radio' || isChecked) ) {
            scope.$apply(function() {
              ngModel.$setViewValue(isChecked);
            });
          }
          return parser(isChecked);
        });

        Event.bind($label, 'focus blur');
      }
    };
  }
]);