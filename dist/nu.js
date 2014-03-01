/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular) {
'use strict';
/*global angular: true*/

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

var random  = {
  id : function(options)  {
    options = angular.extend({pool: '0123456789abcdefghiklmnopqrstuvwxyz', size: 8}, options);

    var randStr = '';
    for (var i = 0; i < options.size; i++) {
      randStr += options.pool[Math.floor(Math.random() * options.pool.length)];
    }
    return randStr;
  }
};

var attribute = {
  move : function(dst, src, names) {
    for (var count = 0; count < names.length; count++) {
      dst.attr(names[count], src.attr(names[count]));
      src.removeAttr(names[count]);
    }
    return dst;
  }
};

var invoke = function(method) {
  var args = Array.prototype.slice.call(arguments, 1);
  if(angular.isFunction(method)){
    var result = method.apply(this, args);
    if( isDefinedAndNotNull(result) ) {
      return result;
    }
  }
  return args.length == 1? args[0] : args;
};


var isDefinedAndNotNull = function(value) {
  return typeof value != 'undefined' && value !== null;
};

var pipeLine = function(pipe, done) {
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
          isAsync = false;
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
};


var list = angular.module('nu.list', []);
list.directive('nuList', [
  function() {
    return {
      template: '<div class="nu list"></div>',
      restrict: 'EACM',
      replace: true,
      controller: ['$scope', '$element', '$attrs', function($scope, $element) {
        this.$render = angular.noop;
        this.$filter = angular.noop;
        this.$link = angular.noop;

        this.$indexOf = angular.noop;
        this.$formatters = [];
        this.$parsers = [];
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
            nuList.$src.unshift(item);
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
            if( isDefinedAndNotNull(item) ) {
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

        attr.$observe('nuListType', function(value) {
          var isIMG = value == 'img';
          engine = engines[(isIMG)? 'img' : 'txt'];
          baseNode = nodes[(isIMG)? 'img' : 'txt'];
        });

        nuList.$render = function(item) {

          var node = baseNode.clone();
          pipeLine(nuList.$formatters, engine(node))
            .onAsync(function(){
              node.addClass('async');
            }).next(item);
          nuList.$render.append(node);
          return node;
        };
        nuList.$render.append = function(node) {
          element.append(node);
        };
      }
    };
  }
]);

list.directive('nuListRemovable', [
  function() {
    return {
      restrict: 'A',
      require: 'nuList',
      link: function(scope, element, attr, nuList) {
        var canRemove, remove_event = function(event) {
          var target = angular.element(event.currentTarget);
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
  function() {
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
        }).on('blur', function() {
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

        nuList.$add = function(item) {
          pipeLine(nuList.$parsers, base$add).next(item);
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

          if(isIMG) {
            nuList.$formatters.unshift(picture_formatter);
          }
        });
      }
    };
  }
]);

list.directive('nuListTypeFilter', [
  function() {
    return {
      restrict: 'A',
      require: 'nuList',
      link: function(scope, element, attr, nuList) {
        var type;
        nuList.$parsers.unshift(function(file){
          if( !isDefinedAndNotNull(type) ||
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
        } else { id = random.id(); }

        attribute.move($input, $element, ['type', 'name', 'checked']).attr('id', id);
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
              return value !== attrs.value;
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
        };

        return link;
      }
    };
  }
]);


var nswitch = angular.module('nu.switch', []);

nswitch.directive('nuSwitch', [
  function() {
    var _template =
    '<div class="nu switch">' +
      '<input class="src" type="checkbox" autocomplete="off">' +
      '<label class="label"></label>' +
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
              return value !== attrs.value;
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


var chooser = angular.module('nu.file.chooser', []);

chooser.directive('nuFileChooser', [
  function() {
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
      compile: function compile($element) {
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

          ngModel.$formatters.unshift(fileFormatter);

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
})(angular);