/*global angular, splitext, basename: true*/

var chooser = angular.module('nu.file.chooser', []);

chooser.directive('nuFileChooser', [
  function() {
    'use strict';
    var _template =
    '<label class="nu file chooser" style="position: relative;">' +
      '<input type="file"/><span></span>' +
      '<a class="remove"></a>' +
    '</label>';

    return {
      template: _template,
      restrict: 'EACM',
      replace: true,
      require: '?ngModel',
      compile: function compile($element) { // $attrs
        var input = $element.find('input');
        var name = $element.find('span');
        var remove = $element.find('a');

        var update_attrs = function(ext, mime, state) {
          $element.attr('ext', ext);
          $element.attr('mime', mime);
          $element.attr('state', state);
        };

        var link = function(scope, element, attrs, ngModel) {

          var fileFormatter = function(value) {
            if(angular.isDefined(value)) {
              var ext, mime, path;
              
              if(angular.isDefined(value.name)) {
                mime = value.type;
                path = value.name;
              } else { path = value; }

              var splitPath = splitext(path);
              ext = (splitPath.length > 1? splitPath[1] : splitPath[0]).toLowerCase();
              update_attrs(ext, mime, 'selected');
              return basename(path);
            }
            return value;
          };

          ngModel.$formatters.push(fileFormatter);

          ngModel.$render = function() {
            name.html(ngModel.$viewValue);
          };
  
          remove.on('click', function() {
            name.html('');
            update_attrs('', '','','select');
            scope.$apply(function() {
              ngModel.$setViewValue(undefined);
            });
          });

          input.on('change', function(event) {
            if( event.currentTarget.files.length > 0 ) {
              scope.$apply(function() {
                ngModel.$setViewValue(event.currentTarget.files[0]);
                ngModel.$viewValue = fileFormatter(ngModel.$viewValue);
                ngModel.$render();
              });
            }
          });
        };

        return link;
      }
    };
  }
]);
