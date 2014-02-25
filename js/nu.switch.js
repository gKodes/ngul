/*global angular, random, attribute*/

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
        } else { id = random.id(); }

        attribute.move($input, $element, ['type', 'name', 'checked']).attr('id', id);
        $label.attr('for', id);

        $attrs.$observe('on', function (value) {
          $label.text(value? value : 'On');
        });

        $attrs.$observe('off', function (value) {
          $label.attr('label-off', value? value : 'Off');
        });

        $attrs.$observe('disabled', function(value) {
          if( angular.isDefined(value) && value !== 'false' ) {
            $input.attr('disabled', value);
          } else { $input.removeAttr('disabled'); }
        });

        var link = function(scope, element, attrs, ngModel) {

          var formater = function(value) {
            return ( (angular.isDefined(attrs.value) &&
              value === attrs.value) || value === true);
          };

          if( ngModel ) {

            ngModel.$formatters.push(formater);

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

            if(scope[attrs.ngModel] || $input[0].defaultChecked) {
              ngModel.$setViewValue( formater(scope[attrs.ngModel]) ||
                ($input[0].defaultChecked && $input[0].checked) );
              ngModel.$render();
            }
          }
        };

        return link;
      }
    };
  }
]);