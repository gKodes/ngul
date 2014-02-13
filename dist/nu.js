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

/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular) {
'use strict';
/*global angular: true*/
  var randomId = function(options) {
    options = angular.extend({pool: '0123456789abcdefghiklmnopqrstuvwxyz', size: 8}, options);

    var randStr = '';
    for (var i = 0; i < options.size; i++) {
      randStr += options.pool[Math.floor(Math.random() * options.pool.length)];
    }
    return randStr;
  };

  var attr = function(dst, src, names) {
    for (var count = 2; count < names.length; count++) {
      dst.attr(names[count], src.attr(names[count]));
      src.removeAttr(names[count]);
    }
    return dst;
  };

  var pb = angular.module('nu.pb', []);

  pb.directive('nuPressButton', [
    function() {
      var _template =
      '<div class="nu button press">' +
        '<input class="src" type="checkbox" autocomplete="off" style="display:none;">' + // ng-model=""
        '<label class="icon {{icon}} {{state}}"></label>' + //nu-switch
      '</div>';

      return {
        template: _template,
        restrict: 'EACM',
        replace: true,
        require: '?ngModel',
        scope: {},
        compile: function compile($element, $attrs) {
          var id = $attrs.id;

          if (id) {
            $element.removeAttr('id');
          } else { id = randomId(); }

          attr($element.find('input'), $element, ['name', 'checked']).attr('id', id);
          var label = $element.find('label');
          label.attr('for', id);

          var link = function(scope, element, attrs, ngModel) {
            var iconOn = null, iconOff = null, labelOn = true, labelOff = false;

            attrs.$observe('on', function (value) { labelOn = value; });
            attrs.$observe('off', function (value) { labelOff = value; });
            attrs.$observe('icon', function (value) { scope.icon = value; });
            attrs.$observe('iconOn', function (value) { iconOn = value; });
            attrs.$observe('iconOff', function (value) { iconOff = value; });

            var input = element.find('input');
            if( ngModel ) {
              ngModel.$render = function() {
                input.checked = (labelOn === ngModel.$viewValue || 
                  (!labelOn & ngModel.$viewValue));
                scope.state = (input.checked && iconOn)? iconOn : iconOff;
              };

              input.on('change', function() {
                var input = this;
                scope.$apply(function() {
                  var isChecked = input.checked;
                  if (attrs.on && attrs.off) {
                    ngModel.$setViewValue(isChecked ? attrs.on : attrs.off);
                  } else { ngModel.$setViewValue(isChecked); }
                  scope.state = (isChecked && iconOn)? iconOn : iconOff;
                });
              });
            }
          };

          return link;
        }
      };
    }
  ]);

})(angular);

/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular) {
'use strict';
/*global angular: true*/
  var randomId = function(options) {
    options = angular.extend({pool: '0123456789abcdefghiklmnopqrstuvwxyz', size: 8}, options);

    var randStr = '';
    for (var i = 0; i < options.size; i++) {
      randStr += options.pool[Math.floor(Math.random() * options.pool.length)];
    }
    return randStr;
  };

  var attr = function(dst, src, names) {
    for (var count = 2; count < names.length; count++) {
      dst.attr(names[count], src.attr(names[count]));
      src.removeAttr(names[count]);
    }
    return dst;
  };

  var nswitch = angular.module('nu.switch', []);

  nswitch.directive('nuSwitch', [
    function() {
      var _template =
      '<div class="nu switch">' +
        '<input class="src" type="checkbox" autocomplete="off">' + // ng-model=""
        '<label class="label" switch-off="{{labelOff}}" ng-bind="labelOn"></label>' + //nu-switch
      '</div>';

      return {
        template: _template,
        restrict: 'EACM',
        replace: true,
        require: '?ngModel',
        scope: {},
        compile: function compile($element, $attrs) {
          var id = $attrs.id;

          if (id) {
            $element.removeAttr('id');
          } else { id = randomId(); }

          attr($element.find('input'), $element, ['name', 'checked']).attr('id', id);
          $element.find('label').attr('for', id);

          var link = function(scope, element, attrs, ngModel) {
            var labelOn = true, labelOff = false;

            attrs.$observe('on', function (value) {
              labelOn = scope.labelOn = value;
            });

            attrs.$observe('off', function (value) {
              labelOff = scope.labelOff = value;
            });

            if( ngModel ) {
              var input = element.find('input');
              ngModel.$render = function() {
                input.checked = (labelOn === ngModel.$viewValue || 
                  (!labelOn & ngModel.$viewValue));
              };

              input.on('change', function() {
                var input = this;
                scope.$apply(function(){
                  if (angular.isDefined(attrs.on) && angular.isDefined(attrs.off)) {
                    ngModel.$setViewValue(input.checked ? attrs.on : attrs.off);
                  } else { ngModel.$setViewValue(input.checked); }
                });
              });
            }
          };

          return link;
        }
      };
    }
  ]);

})(angular);
