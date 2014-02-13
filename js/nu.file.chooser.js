/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular) {
'use strict';
/*global angular: true*/
  var pb = angular.module('nu.file.chooser', []);
  var RE_EXT = /\.([\w\d]+)$/i;
  var RE_BASENAME = /([^\\\/]+)$/;

  var split_re = function(re) {
    var dummy_result = ['',''];
    return function(str) {
      if(str) {
        var splits = str.split(re);
        return splits? splits.splice(0,2) : dummy_result;
      }
      return dummy_result;
    };
  };

  var splitext = split_re(RE_EXT);
  var split = split_re(RE_BASENAME);
  var basename = function(path) { return split(path)[1]; };

  pb.directive('nuFileChooser', ['$parse',
    function($parse) {
      var _template =
      '<label class="nu file chooser" style="position: relative;">' +
        '<input type="file"/>{{path}}' +
        '<a ng-click="clear()" class="remove"></a>' +
      '</label>';

      return {
        template: _template,
        restrict: 'EACM',
        replace: true,
        //require: '?ngModel',
        scope: {},
        controller: function($scope, $element, $attrs) {
          this.$guess_type = null; //function(type, path) {}; // type mime type, path
          var nuFile = this;
          var update_src = function(put_src) {
            return function(src) {
              if( $scope.path !== src ) {
                if(nuFile.$toSrc) {
                  src = nuFile.$toSrc(src);
                }
                put_src(src.name);
              }
            };
          };
          this.$put_src = angular.noop;
          this.$onSelection = angular.noop;
          this.$onClear = angular.noop;
          this.$toPath = function(src) {
            return (src && src.name)? src.name : src;
          };
          this.$toSrc = null;

          $attrs.$observe('src', function (value) {
            // Can go to infinite loop need to check
            nuFile.$put_src = angular.noop;
            var ext = '';
            var state = 'select';
            if(value) {
              var src = $parse(value);
              $scope.path = basename(nuFile.$toPath(src($scope.$parent)));
              if(src.assign) {
                nuFile.$put_src = update_src(src.assign);
              }
              if ($scope.path && '' !== $scope.path.trim()) {
                ext = splitext($scope.path)[1];
                state = 'selected';
              }
            }
            $element.attr('ext', ext);
            $element.attr('state', state);
          });
        },
        compile: function compile($element) { // $attrs
          var input = $element.find('input');

          var update_attrs = function(ext, mime, state) {
            $element.attr('ext', ext);
            $element.attr('mime', mime);
            $element.attr('state', state);
          };

          var link = function(scope, element, attrs, nuFile) {
            var file_selected = function(event) {
              var ext = '';
              var mime = '';
              var file = null;
              var state = 'select';

              if(event.target.files.length > 0) {
                file = event.target.files[0];
                ext = splitext(file.name)[1].toLowerCase();
                mime = file.type;
                if( nuFile.$guess_type ) {
                  mime = nuFile.$guess_type.call(file, mime, file.name, ext);
                }
                state = 'selected';
              }
              scope.$apply(function(scope) {
                scope.path = file? file.name : '';
                nuFile.$put_src(file);
              });
              update_attrs(ext,mime,state);
            };

            input.on('change', file_selected);

            scope.clear = function() {
              scope.path = '';
              nuFile.$put_src(null);
              update_attrs('','','selected');
            };

            //update_attrs('pdf','','selected');
          };

          return link;
        }
      };
    }
  ]);

})(angular);
