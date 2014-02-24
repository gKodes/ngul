// nu.js
(function(scope){
  'use strict';
  /*global angular: true*/
  scope.nu = {
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
    },
    invoke: function(method) {
      var args = Array.prototype.slice.call(arguments, 1);
      if(angular.isFunction(method)){
        var result = method.apply(this, args);
        if( nu.isDefinedAndNotNull(result) ) {
          return result;
        }
      }
      return args.length == 1? args[0] : args;
    },
    isDefinedAndNotNull: function(value) {
      return typeof value != 'undefined' && value !== null;
    },
    pipeLine: function(pipe, done) {
      var PipeLine = function(pipe, done) {
        var index = 0;
        var isAsync = false;
        var onAsync = angular.noop;
        var scope = {
          'async' : function() {
            isAsync = true;
            onAsync();
            return next;
          }
        };

        var next = this.next = function(item){
          while(index < pipe.length) {
            item = pipe[index++].call(scope, item);
            if( isAsync ) {
              this.isAsync = false;
              return this;
            }
          }
          done(item);
          return this;
        };

        this.isAsync = function() {
          return isAsync;
        };

        this.onAsync = function(value) {
          onAsync = value;
          return this;
        };
      };
      return new PipeLine(pipe, done);
    }
  };
})(this);
/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license: MIT
 */

(function(angular, nu) {
'use strict';
/*global nu, angular: true, FileReader: true*/
  var list = angular.module('nu.list', []);
  list.directive('nuList', [
    function() { // try to rename it to collection or list
      return {
        template: '<div class="nu list"></div>',
        restrict: 'EACM', // 145 550 ? 12118
        replace: true,
        controller: ['$scope', '$element', '$attrs', function($scope, $element) {
          this.$render = angular.noop; // invokde for rending an element, expected an compiler
          this.$filter = angular.noop; // invokde before render if return false wont render that element
          this.$link = angular.noop; // invokde after render with the element

          this.$indexOf = angular.noop;
          var nuList = this;

          var render = function(item) {
            var node = nuList.$render(item);
            node.data('src', item);
            nuList.$link(node);
          };

          this.$indexOf = function(node) {
            for(var i = 0; i < nuList.$src.length; i++) {
              if( angular.equals(node, nuList.$src[i]) ) {
                return i;
              }
            }
            return -1;
          };

          this.$add = function(item) {
            if(item) {
              nuList.$src.push(item);
            }
          };

          this.$remove = function(node) {
            nuList.$src.splice(nuList.$indexOf(node), 1);
          };

          this.$empty = function() {
            $element.empty();
          };

          this.$draw = function() {
            nuList.$empty();
            angular.forEach(nuList.$src, function(item) {
              if( nu.isDefinedAndNotNull(item) ) {
                render(item);
              }
            });
          };
        }],
        link: function(scope, element, attrs, nuList) {
          var src = attrs[attrs.nuList? 'nuList' : 'src'];
          scope.$watchCollection(src, function(value) {
            nuList.$src = value? value : [];
            nuList.$draw();
          });
        }
      };
    }
  ]);

  list.directive('nuListType', [
    function() {
      var nodes = {
        'img': angular.element('<span class="item thumb"><img></img></span>'),
        'txt': angular.element('<span class="item"></span>')
      };

      var engines = {
        'img': function(node) {
          return function(value) {
            node.removeClass('async').find('img')
              .attr('src', value);
          };
        },
        'txt': function(node) {
          return function(value) {
            node.removeClass('async').text(value);
          };
        }
      };

      return {
        restrict: 'A',
        require: 'nuList',
        link: function(scope, element, attr, nuList) {
          var engine, baseNode;
          nuList.$formatters = [];

          attr.$observe('nuListType', function(value) {
            var isIMG = value == 'img';
            engine = engines[(isIMG)? 'img' : 'txt'];
            baseNode = nodes[(isIMG)? 'img' : 'txt'];
          });

          nuList.$render = function(item) {
            //TODO: Node Pooling
            var node = baseNode.clone();
            nu.pipeLine(nuList.$formatters, engine(node))
              .onAsync(function(){
                node.addClass('async');
              }).next(item);
            nuList.$render.append(node);
            return node;
          };
          nuList.$render.append = function(node) {
            element.append(node); // angular.element(element[0])
          };
        }
      };
    }
  ]);

  list.directive('nuListRemovable', [
    function() { // ClickToRemove
      return {
        restrict: 'A',
        require: 'nuList',
        link: function(scope, element, attr, nuList) {
          var canRemove, remove_event = function(event) {
            nuList.$remove(target.data('src'));
            scope.$digest();
          };
          
          nuList.$link = function(node) {
            if(canRemove === false) { return; }
            node.addClass('remove').on('click', remove_event);
          };
          
          var updateView = function() {
            var nodes = element.find('span');
            if(canRemove) {
              nodes.addClass('remove').on('click', remove_event);
              return;
            }
            nodes.removeClass('remove').off('click');
          };

          attr.$observe('nuListRemovable', function(value) {
            canRemove = value === 'false'? false: true;
            updateView();
          });
        }
      };
    }
  ]);

  list.directive('nuListAddable', [
    function() { // ClickToRemove
      var linkers = {
        'img' : function(scope, element, attr, nuList) {
          var buffer = angular.element('<label class="buffer img">' +
            '<input type="file"></label>');
          var input = buffer.find('input');
          input.on('change', function(event) {
            for(var i = 0; i < event.currentTarget.files.length; i++) {
              nuList.$add(event.currentTarget.files[i]);
              scope.$digest();
            }
          });
          attr.$observe('multiple', function(value) {
            if(angular.isDefined(value) && value) { input.attr('multiple',''); }
              else { input.removeAttr('multiple'); }
          });

          //buffer.doFocus = angular.noop;
          buffer.doFocus = function(event) {
            if(event.srcElement === element[0]) {
              buffer[0].click();
            }
          };

          return buffer;
        },
        'txt' : function(scope, element, attr, nuList) {
          var buffer = angular.element('<span contenteditable="true" class="buffer">&nbsp;</span>');

          buffer.on('keydown', function(event) {
            var keyCode = (event.which || event.keyCode);
            if (keyCode === 13) {
              var input = this.innerHTML.replace('&nbsp;','').trim();
              this.innerHTML = '';
              //this.blur();
              event.preventDefault();
              if (input !== '') {
                if (input) {
                  nuList.$add(input);
                  scope.$digest();
                }
              }
            }
          }).on('focus', function() {
            this.innerHTML = this.innerHTML.replace('&nbsp;', '');
          }).on('blur', function() { // event
            if(this.innerHTML === '') { this.innerHTML = '&nbsp;'; }
          });

          buffer.doFocus = function(event) {
            event.stopPropagation();
            buffer[0].focus();
          };

          return buffer;
        }
      };

      return {
        restrict: 'A',
        require: 'nuList',
        link: function(scope, element, attr, nuList) {
          var buffer, elementRaw = element[0], hasBuffer, base$add = nuList.$add;
          nuList.$parsers = [];
          nuList.$add = function(item) {
            nu.pipeLine(nuList.$parsers, base$add).next(item);
          };
          
          var nuList$empty = nuList.$empty;
          var empty = function() {
            while(elementRaw.firstChild != elementRaw.lastChild) {
              angular.element(elementRaw.firstChild).remove();
            }
          };

          var nuList$render_append = nuList.$render.append;
          var append = function(node) {
            elementRaw.insertBefore(node[0], buffer[0]);
          };

          var picture_push = function() {
            this.done(this.result);
          };

          var picture_formatter = function(value) {
            if(value.name && value.type && value.type.match(/image.*/)) {
              var reader = new FileReader();
              reader.done = this.async();
              reader.onload = picture_push;
              reader.readAsDataURL(value);
            }
            return value;
          };

          var updateBuffer = function() {
            element.off('mouseup');
            if(buffer) {
              if( !hasBuffer && buffer[0].parentNode === element[0]) {
                element[0].removeChild(buffer[0]);
                nuList.$empty = nuList$empty;
                nuList.$render.append = nuList$render_append;
                return;
              }

              element.append(buffer);
              nuList.$empty = empty;
              nuList.$render.append = append;
              element.on('mouseup', buffer.doFocus);
            }
          };

          attr.$observe('nuListAddable', function(value) {
            hasBuffer = value !== 'false'? true: false;
            updateBuffer();
          });

          attr.$observe('nuListType', function(value) {
            var isIMG = value == 'img';
            var get_buffer = linkers[isIMG? 'img' : 'txt'];
            if(buffer) {
              if(buffer[0].parentNode === element[0]) {
                buffer.remove();
              }
              buffer.unbind();
            }

            buffer = get_buffer(scope, element, attr, nuList);
            updateBuffer();

            if(isIMG) { // TODO: remove the formater if type changes
              nuList.$formatters.push(picture_formatter);
            }
          });
        }
      };
    }
  ]);

  list.directive('nuListTypeFilter', [
    function() { // ClickToRemove
      return {
        restrict: 'A',
        require: 'nuList', // nuListAddable
        link: function(scope, element, attr, nuList) {
          var type;
          nuList.$parsers.push(function(file){
            if( !nu.isDefinedAndNotNull(type) ||
                    file.type.match(type) ) {
              return file;
            }
          });

          attr.$observe('nuListTypeFilter', function(value) {
            type = new RegExp(value);
          });
        }
      };
    }
  ]);
//TODO: Need to support two events onRemove onAdd
})(angular, nu);

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
