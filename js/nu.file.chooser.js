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
      link: function(scope, element, attrs, ngModel) {
        var input = element.find('input');
        var name = element.find('span');
        var remove = element.find('a');

        var update_attrs = function(ext, mime, state) {
          element.attr('ext', ext);
          element.attr('mime', mime);
          element.attr('state', state);
        };

        /**
         * Derive to name only and then update attrs ext and mime
         */
        var nameOnly = function(value) {
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

        if( ngModel ) {
          ngModel.$formatters.unshift(nameOnly);

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
        }

        input.on('change', function(event) {
          if( event.currentTarget.files.length > 0 ) {
            var file = event.currentTarget.files[0];
            if(ngModel) {
              scope.$apply(function() {
                ngModel.$setViewValue(file);
              });
            }
            name.html(nameOnly(file));
          }
        });
      }
    };
  }
]);
