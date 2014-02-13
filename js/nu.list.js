/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license: MIT
 */

(function(angular) {
'use strict';
/*global angular: true, FileReader: true*/
  var list = angular.module('nu.list', []);
  list.directive('nuList', ['$parse',
    function($parse) { // try to rename it to collection or list
      return {
        template: '<div class="nu list"></div>',
        restrict: 'EACM', // 145 550 ? 12118
        replace: true,
        controller: function($scope, $element, $attrs) {
          this.$render = angular.noop; // invokde for rending an element, expected an compiler
          this.$filter = angular.noop; // invokde before render if return false wont render that element
          this.$link = angular.noop; // invokde after render with the element
          var $srcVar = this.$srcVar = $attrs[$attrs.nuList? 'nuList' : 'src'];
          var $src = this.$src = $parse($srcVar)($scope);
          // INFO: onRender - before render is called translate to string if object
          var onRender = this.$onRender = null;
          // INFO: onAppend - before appending to list (return value is appened)
          var onAppend = this.$onAppend = null;

          $attrs.$observe('onRender', function (value) {
            onRender = $parse(value)($scope);
          });

          $attrs.$observe('onAppend', function (value) {
            onAppend = $parse(value)($scope);
          });

          this.$add = function(item) {
            if(onRender) {
              item = onAppend(item);
            }
            if(item) {
              $src.push(item);
            }
          };

          this.$remove = function(index) {
            if(typeof item !== 'number') {
              // TODO: find the index
            }
            $scope.$apply(function(scope) {
              $src.splice(index,1);
            });
          };

          var nuList = this;
          var $draw = this.$draw = function(values) {
            var list_element = angular.element($element);
            angular.forEach(values, function(value, index) {
              if(this.$onAppend) {
                values = nuList.$onAppend(values);
              }
              if( value ) {
                var item = nuList.$render(value);
                if( item ) { // item
                  angular.element(item).data('index', index);
                  nuList.$link(item);
                  this.append(item);
                }
              }
            }, list_element.html(''));
          };

          this.$redraw = function() {
            $scope.apply(function(scope) { $draw($src); });
          };
        },
        link: function(scope, element, attr, nuList) {
          scope.$watchCollection(nuList.$srcVar, nuList.$draw);
        }
      };
    }
  ]);

  list.directive('nuListType', ['$compile',
    function() {

      var picture_renderer = function(item) {
          return angular.element('<span class="item thumb">' +
            '<img src="' + item + '"></img></span>');
      };

      var text_renderer = function(item) {
        return angular.element('<span class="item">' + item + '</span>');
      };

      return {
        restrict: 'A',
        require: 'nuList',
        link: function(scope, element, attr, nuList) {
          nuList.$render = (attr.nuListType === 'img')?
              picture_renderer: text_renderer;
        }
      };
    }
  ]);

  list.directive('nuListRemovable', ['$compile',
    function() { // ClickToRemove
      return {
        restrict: 'A',
        require: 'nuList',
        link: function(scope, element, attr, nuList) {
          var remove_event = function(event) {
            nuList.$remove(
              angular.element(event.currentTarget).data('index'));
          };
          nuList.$link = function(item) {
            item.addClass('remove').on('click', remove_event); // click-
          };
        }
      };
    }
  ]);

  list.directive('nuListAddable', ['$timeout',
    function($timeout) { // ClickToRemove
      var picture_buffer = function(scope, element, attr, nuList) {
          var buffer_wrap = angular.element('<label class="buffer img"></label>');
          var buffer_src = angular.element('<input type="file" multiple>');
          buffer_wrap.append(buffer_src);
          var renderTime = null;
          var reader = null;

          var push_img = function(event){ 
            nuList.$add(event.target.result);
            if( event.target === reader ) {
              reader = null;
              scope.$digest();
            }
          };
          //}); take time out and apply

          buffer_src.on('change', function() {
            var selector = this;
            
            for(var i = 0; i < selector.files.length; i++) {
              var src = selector.files[i];
              if(src.type.match(/image.*/)) {
                reader = new FileReader();
                reader.onload = push_img;
                reader.readAsDataURL(src);
              }
            }
          });

          return buffer_wrap;
      };

      var text_buffer = function(scope, element, attr, nuList) {
          var buffer_element = angular.element('<span contenteditable="true" class="buffer">\u00a0</span>');

          buffer_element.on('keydown', function(event) {
            var keyCode = (event.which || event.keyCode);
            if (keyCode === 13) {
              var input = this.innerHTML.replace('&nbsp;','').trim();
              this.blur();
              event.preventDefault();
              if (input !== '') {
                if (input) {
                  scope.$apply(function() { nuList.$add(input); });
                }
              }
            }
          });

          return buffer_element;
      };

      return {
        restrict: 'A',
        require: 'nuList',
        link: function(scope, element, attr, nuList) {
          var core_draw = nuList.$draw;

          nuList.$draw = function() {
            var buffer = (attr.nuListType === 'img'?
                picture_buffer: text_buffer)(scope, element, attr, nuList);
            core_draw.apply(this, arguments);
            element.append(buffer);
            //element.on( "mouseup", function() { inputTag.focus(); });
          };
        }
      };
    }
  ]);

})(angular);
