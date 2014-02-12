/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular) {
'use strict';
/*global angular: true*/
  var pb = angular.module('nu.file.chooser', []);

  pb.directive('nuFileChooser', ['$parse',
    function($parse) {
      var _template =
      '<div class="nu file chooser" style="position: relative;">' +
        // '<a style="position: absolute;left: 0;top: 0;" class="mime blue {{icon.mime}}"></a>' +
        '<label class="{{mime}} {{state}}" ext="{{ext}}"><input type="file"/>{{path}}</label>' +
        '</a><a style="position: absolute;right: 0;top: 0;" ng-click="clear()" class="{{remove_icon}}"></a>' +
      '</div>';

      return {
        template: _template,
        restrict: 'EACM',
        replace: true,
        //require: '?ngModel',
        scope: {},
        controller: function($scope, $element, $attrs) {
          $scope.icon = {};
          this.$guess_type = null; //function(type, path) {}; // type mime type, path
          $scope.state = this.$status = null;
          $scope.remove_icon = this.$remove_icon = null;
          var $put_src = this.$put_src = angular.noop;

          $attrs.$observe('src', function (value) {
            $put_src = $parse(value).assign; // ($scope)
          });
        },
        compile: function compile($element, $attrs) {
          this.$remove_icon = $attrs.iconRemove;
          this.$status = 'select';

          var input = $element.find('input');

          var link = function(scope, element, attrs, nuFile) {
            var file_selected = function(event) {
              var file = event.target.files[0];
              scope.$apply(function(scope){
                if( nuFile.$guess_type ) {
                  scope.mime = nuFile.$guess_type.call(file, file.type, file.name);
                }
                scope.path = file.name;
                scope.ext = scope.path.split('.').pop();
                scope.state = 'selected'; // 'select'
                if( nuFile.$put_src ) {
                  nuFile.$put_src(file);
                }
              });
            };

            input.on('change', file_selected);

            scope.clear = function() {
              scope.$apply(function(scope){
                scope.state = 'select';
                scope.path = '';
              });

              //input.remove();
              //input
              //input.on('change', file_selected);
            };
          };

          return link;
        }
      };
    }
  ]);

})(angular);
