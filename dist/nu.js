// nu.js
//'use strict';
/*global angular: true*/
var nu = {
  random : {
    id : function(options)  {
      options = angular.extend({pool: '0123456789abcdefghiklmnopqrstuvwxyz', size: 8}, options);

      var randStr = '';
      for (var i = 0; i < options.size; i++) {
        randStr += options.pool[Math.floor(Math.random() * options.pool.length)];
      }
      return randStr;
    }
  },
  attr: {
    move : function(dst, src, names) {
      for (var count = 0; count < names.length; count++) {
        dst.attr(names[count], src.attr(names[count]));
        src.removeAttr(names[count]);
      }
      return dst;
    }
  },
  'switch': function(isTrue, onTrue, onFalse) {
    if (onTrue && onFalse) {
      return isTrue ? onTrue : onFalse;
    }
    return isTrue;
  }
};
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
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
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
        }],
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

(function(angular, nu) {
  'use strict';
  /*global angular, nu: true*/

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
        compile: function compile($element, $attrs) {
          var id = $attrs.id;
          var $input = $element.find('input');
          var $label = $element.find('label');

          if (id) {
            $element.removeAttr('id');
          } else { id = nu.random.id(); }

          nu.attr.move($input, $element, ['type', 'name', 'checked']).attr('id', id);
          $label.attr('for', id);

          var link = function(scope, element, attrs, ngModel) {
            attrs.$observe('iconOn', function(value) {
              angular.element($label[0]).attr('class',
                (attrs.icon? attrs.icon : '') + (value? ' ' + value : ''));
            });
            attrs.$observe('iconOff', function(value) {
              angular.element($label[1]).attr('class',
                (attrs.icon? attrs.icon : '') + (value? ' ' + value : ''));
            });

            if( ngModel ) {

              ngModel.$formatters.push(function(value) {
                return ( (angular.isDefined(attrs.value) &&
                  value === attrs.value) || value === true);
              });

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
                var isChecked = this.checked;
                event.stopPropagation();
                if( this.type !== 'radio' || isChecked ) {
                  scope.$apply(function() {
                    ngModel.$setViewValue(isChecked);
                  });
                }
              });

              if(angular.isDefined(scope[attrs.ngModel])) {
                ngModel.$setViewValue(scope[attrs.ngModel]);
              } else if($input[0].defaultChecked) { ngModel.$setViewValue($input[0].checked); }
            }
          };

          return link;
        }
      };
    }
  ]);

})(angular, nu);
/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular, nu) {
  'use strict';
  /*global angular, nu: true*/

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
          } else { id = nu.random.id(); }

          nu.attr.move($input, $element, ['type', 'name', 'checked']).attr('id', id);
          $label.attr('for', id);

          $attrs.$observe('on', function (value) {
            $label.text(value? value : 'On');
          });

          $attrs.$observe('off', function (value) {
            $label.attr('label-off', value? value : 'Off');
          });

          var link = function(scope, element, attrs, ngModel) {

            if( ngModel ) {

              ngModel.$formatters.push(function(value) {
                return ( (angular.isDefined(attrs.value) &&
                  value === attrs.value) || value === true);
              });

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

              if(angular.isDefined(scope[attrs.ngModel])) {
                ngModel.$setViewValue(scope[attrs.ngModel]);
              } else if($input[0].defaultChecked) { ngModel.$setViewValue($input[0].checked); }
            }
          };

          return link;
        }
      };
    }
  ]);

})(angular, nu);
/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular) {
'use strict';
/*global angular: true*/
  var chooser = angular.module('nu.file.chooser', []);
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

  chooser.directive('nuFileChooser', ['$parse',
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
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
          this.$guess_type = null; //function(type, path) {}; // type mime type, path
          var nuFile = this;
          var update_src = function(put_src) {
            return function(src) {
              if( $scope.path !== src ) {
                if(nuFile.$toSrc) {
                  src = nuFile.$toSrc(src);
                }
                put_src($scope.$parent, src);
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
                ext = splitext($scope.path).pop();
                state = 'selected';
              }
            }
            $element.attr('ext', ext);
            $element.attr('state', state);
          });
        }],
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
