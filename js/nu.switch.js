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
        var id = attrs.id,
            input = element.find('input'),
            label = element.find('label'),
            Event = nuEvent(scope, attrs),
            ngModelGet = $parse(attrs.ngModel);

        if (id) {
          element.removeAttr('id');
        } else { id = random.id(); }

        move.attribute(input, element, ['type', 'name', 'checked']).attr('id', id);
        label.attr('for', id);

        attrs.$observe('on', function (value) {
          label.text(value? value : 'On');
        });

        attrs.$observe('off', function (value) {
          label.attr('label-off', value? value : 'Off');
        });

        attrs.$observe('disabled', function(value) {
          if( angular.isDefined(value) && value !== 'false' ) {
            input.attr('disabled', value);
          } else { input.removeAttr('disabled'); }
        });

        var formater = function(value) {
          return ( (angular.isDefined(attrs.ngTrueValue) &&
            value === attrs.ngTrueValue) || value === true);
        };

        var parser = function(value) {
          if(attrs.ngTrueValue) {
            return value ? attrs.ngTrueValue : attrs.ngFalseValue;
          }
          return value;
        };

        if( ngModel ) {

          ngModel.$formatters = [formater];
          ngModel.$parsers = [parser];

          ngModel.$isEmpty = function(value) {
            return value !== attrs.ngTrueValue; // this.type !== 'radio'
          };

          ngModel.$render = function() {
            input[0].checked = ngModel.$viewValue;
          };

          var ngModelValue = ngModelGet(scope);
          if(ngModelValue || input[0].defaultChecked) {
            if( formater(ngModelValue) || input[0].defaultChecked && input[0].checked ) {
              ngModel.$setViewValue(true);
            }
            ngModel.$render();
          }

          element.off('click');
        }

        input.on('change', function(event) {
          var isChecked = this.checked;
          event.stopPropagation(); // 
          if( ngModel && (this.type !== 'radio' || isChecked) ) {
            scope.$apply(function() {
              ngModel.$setViewValue(isChecked);
            });
          }
          Event.trigger('change', {'target': attrs.name, 'value': parser(isChecked)});
        });

        // Event.bind(label, 'focus blur')
      }
    };
  }
]);