/*global angular, random, attribute*/

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
      link: function(scope, element, attrs, ngModel) {
        var id = attrs.id;
        var $input = element.find('input');
        var $label = element.find('label');

        if (id) {
          element.removeAttr('id');
        } else { id = random.id(); }

        attribute.move($input, element, ['type', 'name', 'checked']).attr('id', id);
        $label.attr('for', id);

        attrs.$observe('iconOn', function(value) {
          angular.element($label[0]).attr('class',
            (attrs.icon? attrs.icon : '') + (value? ' ' + value : ''));
        });

        attrs.$observe('iconOff', function(value) {
          angular.element($label[1]).attr('class',
            (attrs.icon? attrs.icon : '') + (value? ' ' + value : ''));
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

        if( ngModel ) {

          ngModel.$formatters.unshift(formater);

          ngModel.$parsers.unshift(function(value) {
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

          if(scope[attrs.ngModel] || $input[0].defaultChecked) {
            ngModel.$setViewValue( formater(scope[attrs.ngModel]) ||
              ($input[0].defaultChecked && $input[0].checked) );
            ngModel.$render();
          }
        }
      }
    };
  }
]);