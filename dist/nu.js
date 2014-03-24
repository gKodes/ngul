/**
 * ngul 0.4
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular, nu) {
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

var chainIt = function() {
    if(!arguments[0] && arguments.length == 2) {
    return arguments[1];
  }
  var seq = arguments;
  return function() {
    for(var i = 0; i < seq.length; i++) {
      seq[i].apply(null, arguments);
    }
  };
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




var pb = angular.module('nu.pb', ['nu.event']);

pb.directive('nuPressButton', ['nuEvent',
  function(nuEvent) {
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
        var input = element.find('input');
        var label = element.find('label');
        var Event = nuEvent(scope, attrs);

        if (id) {
          element.removeAttr('id');
        } else { id = random.id(); }

        attribute.move(input, element, ['type', 'name', 'checked']).attr('id', id);
        label.attr('for', id);

        attrs.$observe('iconOn', function(value) {
          angular.element(label[0]).attr('class',
            (attrs.icon? attrs.icon : '') + (value? ' ' + value : ''));
        });

        attrs.$observe('iconOff', function(value) {
          angular.element(label[1]).attr('class',
            (attrs.icon? attrs.icon : '') + (value? ' ' + value : ''));
        });

        attrs.$observe('disabled', function(value) {
          if( angular.isDefined(value) && value !== 'false' ) {
            input.attr('disabled', value);
          } else { input.removeAttr('disabled'); }
        });

        var formater = function(value) {
          return ( (angular.isDefined(attrs.value) &&
            value === attrs.value) || value === true);
        };

        var parser = function(value) {
          if(attrs.value) {
            return value ? attrs.value : attrs.valueOff;
          }
          return value;
        };

        if( ngModel ) {

          ngModel.$formatters.unshift(formater);
          ngModel.$parsers.unshift(parser);

          ngModel.$isEmpty = function(value) {
            return value !== attrs.value;
          };

          ngModel.$render = function() {
            input[0].checked = ngModel.$viewValue;
          };

          if(scope[attrs.ngModel] || input[0].defaultChecked) {
            ngModel.$setViewValue( formater(scope[attrs.ngModel]) ||
              (input[0].defaultChecked && input[0].checked) );
            ngModel.$render();
          }
        }

        Event.bind(input, 'change', function(event) {
          var isChecked = this.checked;
          event.stopPropagation();
          if( ngModel && (this.type !== 'radio' || isChecked) ) {
            scope.$apply(function() {
              ngModel.$setViewValue(isChecked);
            });
          }
          return {'target': attrs.name, 'value': parser(isChecked)};
        });

        Event.bind(label, 'focus blur');
      }
    };
  }


]);


var nswitch = angular.module('nu.switch', ['nu.event']);

nswitch.directive('nuSwitch', ['nuEvent',
  function(nuEvent) {
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

      link: function(scope, element, attrs, ngModel) {
        var id = attrs.id;
        var input = element.find('input');
        var label = element.find('label');
        var Event = nuEvent(scope, attrs);

        if (id) {
          element.removeAttr('id');
        } else { id = random.id(); }

        attribute.move(input, element, ['type', 'name', 'checked']).attr('id', id);
        label.attr('for', id);

        attrs.$observe('on', function (value) {
          label.text(value? value : 'On');
        });

        attrs.$observe('off', function (value) {
          label.attr('label-off', value? value : 'Off');
        });

        attrs.$observe('disabled', function(value) {
          if( angular.isDefined(value) && value !== 'false' ) {
            input.attr('disabled', value);
          } else { input.removeAttr('disabled'); }
        });

        var formater = function(value) {
          return ( (angular.isDefined(attrs.value) &&
            value === attrs.value) || value === true);
        };

        var parser = function(value) {
          if(attrs.value) {
            return value ? attrs.value : attrs.valueOff;
          }
          return value;
        };

        if( ngModel ) {

          ngModel.$formatters.push(formater);
          ngModel.$parsers.push(parser);

          ngModel.$isEmpty = function(value) {
            return value !== attrs.value;
          };

          ngModel.$render = function() {
            input[0].checked = ngModel.$viewValue;
          };

          if(scope[attrs.ngModel] || input[0].defaultChecked) {
            ngModel.$setViewValue( formater(scope[attrs.ngModel]) ||
              (input[0].defaultChecked && input[0].checked) );
            ngModel.$render();
          }
        }

        Event.bind(input, 'change', function(event) {
          var isChecked = this.checked;
          event.stopPropagation();
          if( ngModel && (this.type !== 'radio' || isChecked) ) {
            scope.$apply(function() {
              ngModel.$setViewValue(isChecked);
            });
          }
          return {'target': attrs.name, 'value': parser(isChecked)};
        });

        Event.bind(label, 'focus blur');
      }
    };
  }
]);


var chooser = angular.module('nu.file.chooser', ['nu.event']);

chooser.directive('nuFileChooser', ['nuEvent',
  function(nuEvent) {
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
        var Event = nuEvent(scope, attrs);

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


        Event.bind(input, 'change', function(event) {
          if( event.currentTarget.files.length > 0 ) {
            var file = event.currentTarget.files[0];
            if(ngModel) {
              scope.$apply(function() {
                ngModel.$setViewValue(file);
              });
            }
            name.html(nameOnly(file));
            return {'target': attrs.name, 'value': event.currentTarget.files};
          }
          return {'target': attrs.name};
        });

        Event.bind(element, 'focus blur');
      }
    };
  }
]);


var gallery = angular.module('nu.gallery', []);
gallery.directive('nuGallery', [
  function() {
        var setActive = function() {
      angular.element(arguments).toggleClass('active');
      return arguments[arguments.length - 1];
    };

    return {
      template: '<div class="nu gallery"><a class="arrow right"></a><a class="arrow left"></a></div>',
      restrict: 'EACM',
      replace: true,
      require: '?ngModel',
      transclude: true,
      link: function(scope, element, attrs, ngModel, transcludeFn) {
        var imgs, active, transcludes = [], rawElement = element[0], dummy = angular.element('<img/>')[0];

        if(ngModel) {
          scope.$watchCollection(attrs.ngModel, function(viewValue) {
            if(angular.isArray(viewValue) && viewValue.length > 0) {
              angular.forEach(viewValue, function(item, index) {
                if ( !imgs[index] ) { imgs[index] = angular.element('<img/>')[0]; }
                if ( imgs[index] && imgs[index].parentNode !== rawElement ) { element.append(imgs[index]); }

                angular.element(imgs[index]).attr('src', item.src || item);
              });
              for(var i = viewValue.length; i < imgs.length; i++) {
                angular.element(imgs[i]).remove();
              }

              imgs = element.find('img');
              if(!active || active.parentNode !== rawElement) {
                active = setActive(imgs[0]);
              }
            } else { angular.element(imgs).remove(); }
          });
        }

        transcludeFn(function(nodes) { 
          angular.forEach(nodes, function(node) {
            if(node.tagName && node.tagName.toLowerCase() === 'img') {
              transcludes.push(node);
            }
          });
        });
        element.append(transcludes);
        imgs = element.find('img');
        if(imgs && imgs.length > 0) {
          active = setActive(imgs[0]);
        }

        var arrowActions = [
          function() {  active = setActive(active, active.nextSibling || imgs[0]); },
          function() {  active = setActive(active, 
            (active.previousSibling.tagName.toLowerCase() === 'img')? active.previousSibling : imgs[imgs.length - 1]); }
        ];

        angular.forEach(element.find('a'), function(arrow, count) {
          angular.element(arrow).on('click', arrowActions[count]);
        });
      }
    };
  }
]);

gallery.directive('nuPreviewStrip', [
  function() {
        return {
      restrict: 'EACM',
      replace: true,
      require: 'nuGallery',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$render = chainIt(ngModel.$render, function() {

        });
      }
    };
  }
]);




var slider = angular.module('nu.slider', []);
slider.service('_ScrollSize', ['$window', function($window) {
    var height, width, sliders = [],
  scrollNode = angular.element(
    '<div style="width:100px;height:100px;overflow:scroll;">' +
      '<div style="width:200px;height:200px;"></div>' +
    '</div>');
  
  var calcDimension = function(element, frame) {
    var rawElement = element[0],
        rawFrame = frame[0];
    if(rawFrame.offsetWidth >= rawElement.clientWidth) {
      element.css({'maxHeight': rawFrame.clientHeight + 'px'});
    }

    sliders.push([rawElement, rawFrame]);

    frame.css({
      'height': (100 + ((height / rawElement.clientHeight)* 100)) + '%',
      'width': (100 + ((width / rawElement.clientWidth) * 100)) + '%'
    });
  };

  angular.element($window).on('resize', function() {
    angular.forEach(sliders, function(slider) {
      calcDimension.apply(null, slider);
    });
  });

  this.estimate = function() {
    angular.element($window.document.body).append(scrollNode);
    height = (scrollNode[0].offsetHeight - scrollNode[0].clientHeight);
    width = (scrollNode[0].offsetWidth - scrollNode[0].clientWidth);
    scrollNode.remove();
  };

  this.height = function() { return height; };
  this.width = function() { return width; };
  this.hideBars = function(element, frame) {
    calcDimension(element, frame);
  };

  this.estimate();
}]);

slider.directive('nuSlider', ['_ScrollSize',
  function(scrollSize) {
        var template =
      '<div class="nu slider">' +
        '<div class="frame" style="overflow:scroll;"></div>'+
      '</div>';

    return {
      replace: true,
      template: template,
      restrict: 'EACM',
      transclude: true,
      link: function(scope, element, attrs, ngController, transclude) {
        var frame = element.css('overflow','hidden').find('div');

        transclude(scope, function(clone) {
          frame.append(clone);
          scrollSize.hideBars(element, frame);
        });
      }
    };
  }
]);

var Event = angular.module('nu.event', []);

Event.service('nuEvent', ['$parse', function($parse) {
    var nuEventCreator = function(scope, attrs) {
    var NUEvent = function(scope, attrs) {
      var Event = {};
      angular.forEach(attrs, function(value, name) {
        if(angular.isString(name)) {
          var indexOfnu = name.indexOf('nu');
          if( indexOfnu === 0 ) {
            Event[name.substr(2).toLowerCase()] = $parse(value);
          }
        }
      });

      var trigger = this.trigger = function(name, event) {
        if(Event[name]) {
          Event[name](scope, {'$event': event});
          scope.$digest();
        }
      };

      this.bind = function(element, name, transformationFn) {
        angular.forEach(name.split(' '), function(ename) {
          if(Event[ename] || transformationFn) {
            element.on(ename, function(event) {
              trigger(ename, (transformationFn || angular.identity).call(this, event));
            });
          }
        });
      };
    };

    return new NUEvent(scope, attrs);
  };

  return nuEventCreator;
}]);})(angular, this.nu = this.nu || {});