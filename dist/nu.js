/**
 * ngul 0.4
 * Copyright 2013-2014 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * @license : MIT
 */

(function(angular) {
'use strict';
/*global angular: true*/

var VALID_CLASS = 'ng-valid',
    INVALID_CLASS = 'ng-invalid',
    PRISTINE_CLASS = 'ng-pristine',
    DIRTY_CLASS = 'ng-dirty';

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

var move = {},
    random = {},
    nodes = {},
    path = {},
    noop = angular.noop,
    copy = angular.copy,
    equals = angular.equals,
    forEach = angular.forEach,
    isArray = angular.isArray,
    isObject = angular.isObject,
    isString = angular.isString,
    isElement = angular.isElement,
    isFunction = angular.isFunction,
    isUndefined = angular.isUndefined,
    lowercase = angular.lowercase,
    extend = angular.extend,
    nuError = angular.$$minErr('nu');

function isDefinedAndNotNull(value) {
    return typeof value !== 'undefined' && value !== null;
}

function trim(str) {
    return isString(str)? str.replace(/^\s+|\s+$/g, '') : '';
}

function partial(fn, args, scope) {
    return function() {
    return fn.apply(scope, args.concat(Array.prototype.slice.call(arguments, 0)));
  };
}

function startsWith(str, subStr) {
    return isString(str) && isString(subStr) && str.indexOf(subStr) === 0;
}

/**
 * Split the pathname `path` into a pair (`root`, `ext`) such that `root + ext == path`.
 * If `ext` is empty will return the basename it self, an `ext` begins with a period followed by any char's. 
 * Leading periods on the basename are ignored; splitext('.cshrc') returns ('', '.cshrc').
 */
path.splitext = function(input_path) {
  var basepath = path.basename(input_path),
      index = basepath.lastIndexOf('.');
  return index === -1? [basepath, ''] : 
    [basepath.substr(0, index), basepath.substr(index)];
};

/**
 * Return the base name of pathname path. Where basename for '/foo/bar' returns 'bar' and for '/foo/bar/' return an empty string ''.
 */
path.basename = function(input_path) {
  var basea = RE_BASENAME.exec(input_path);
  return basea? basea[1]: input_path;
};

function toBoolean(rawValue) {
    if( rawValue && isString(rawValue) ) {
    var value = rawValue.toLowerCase();
    return !(value === 'false' || value === 'f' || value === 'off');
  }
  return rawValue === true;
}

function isFile(blob) {
    return blob && blob.lastModifiedDate && isString(blob.type);
}

random.defaults = { pool: '0123456789abcdefghiklmnopqrstuvwxyz', size: 8 };
random.id = function(options) {
    options = extend(random.defaults, options);

  var randStr = '';
  for (var i = 0; i < options.size; i++) {
    randStr += options.pool[Math.floor(Math.random() * options.pool.length)];
  }
  return randStr;
};

move.attribute = function(dst, src, names) {
  for (var count = 0; count < names.length; count++) {
    dst.attr(names[count], src.attr(names[count]));
    src.removeAttr(names[count]);
  }
  return dst;
};

nodes.move = move;
nodes.append = {};
nodes.append.text = function(parent, text, beforeNode) {
    var textNode = document.createTextNode(text);
  parent.insertBefore(textNode, beforeNode);
  return textNode;
};

var getngModelWatch = function(scope, ngModel, modelValue, ngModelSet) {
    var length = scope.$$watchers.length,
      $render = ngModel.$render,
      uid = random.id(), isMatch = false;
  ngModelSet(scope, uid);
  ngModel.$render = function() { isMatch = true; };
  while(length--) {
    if( scope.$$watchers[length].get === scope.$$watchers[length].exp ) {
      scope.$$watchers[length].get();
      if( isMatch ) {
        break;
      }
    }
  }
  ngModel.$render = $render;
  ngModelSet(scope, modelValue);
  return scope.$$watchers[length];
};

var NuEventManager = (function() {
    var _export = function() {
    this.events = {};
  };

  _export.prototype.on = function(eventType, handler) {
    if( !this.events[eventType] ) { this.events[eventType] = []; }
    this.events[eventType].push(handler);
  };
  _export.prototype.off = function(eventType, handler) {
    if( this.events[eventType] ) {
      var index = this.events[eventType].indexOf;
      if ( index !== -1 ) {
        return this.events[eventType].split(index, 1)[0];
      }
    }
  };
  _export.prototype.trigger = function(eventType, extraParameters) {
    if(this.events[eventType]) {
      forEach(this.events[eventType], function(fn) {
        fn(extraParameters);
      });
    }
    return extraParameters;
  };

  return _export;
})(forEach);


var nullInputngModle = {
  $isEmpty: angular.identity,
  $formatters: [],
  $parsers: [],
  $setViewValue: function(value) {
        forEach(this.$parsers, function(fn) {
      value = fn(value);
    });
    this.$modelValue = value;
  },
  isNull: true
};
function initTwoStateSwtich(scope, element, attrs, ngModel, Event, defaultValue) {
    var id = attrs.id,
      input = element.find('input'),
      label = element.find('label'),
      trueValue = attrs.ngTrueValue,
      falseValue = attrs.ngFalseValue;

  ngModel = ngModel || nullInputngModle;


  if (id) {
    element.removeAttr('id');
  } else { id = random.id(); }


  move.attribute(input, element, ['type', 'name', 'checked']).attr('id', id);
  label.attr('for', id);

  if( !ngModel.$isEmpty( isString(trueValue)? trueValue : true) || ngModel.isNull ) {

    ngModel.$isEmpty = function(value) {
      return value !== trueValue;
    };

    ngModel.$formatters.push(function(value) {
      if( trueValue ) {
        return value === trueValue;
      }
      return value;
    });

    ngModel.$parsers.push(function(value) {
      if( trueValue ) {
        return value ? trueValue : falseValue;
      }
      return value;
    });
  }

  element.off('click');
  input.off('click');

  ngModel.$render = function() {
    input[0].checked = ngModel.$viewValue;
  };

  if( input[0].defaultChecked && input[0].checked ) {
    ngModel.$setViewValue(true);
  }

  if( !ngModel.isNull && angular.isDefined(defaultValue) ) {
    var value;
    if( isString(defaultValue) ) {
      if(defaultValue === trueValue) { value = true; }
        if(defaultValue === falseValue) { value = false; }
    } else { value = defaultValue; }
    
    if(value) {
      ngModel.$setViewValue(value);
      ngModel.$render();
    }
  }

  input.on('change', function pbChange(event) {
    var isChecked = this.checked;
    event.stopPropagation();
    if( (this.type !== 'radio' || isChecked) ) {
      ngModel.$setViewValue(isChecked);
      if( !ngModel.isNull ) { scope.$digest(); }
    }

    Event.trigger('change', {'target': attrs.name, 'value': ngModel.$modelValue });
  });

  attrs.$observe('disabled', function(value) {
    if( angular.isDefined(value) && value !== 'false' ) {
      input.attr('disabled', value);
    } else { input.removeAttr('disabled'); }
  });
}





var nuList = angular.module('nu.List', []);

/**
 * @ngdoc object
 * @name ng.directive:nuList.NuListController
 *
 * @property {Object|Array} $viewValue Actual value in the view.
 * @property {Object|Array} $modelValue The value in the model, that the control is bound to.
 * @property {Function} $itemCompiler and compiled Item Node using `$compile` service.
 *    This would be called with a `Scope` and an cloneAttachFn.
 * @property {Function} $itemNodeFactory fn that takes one argument
 * @property {Function} $removeItem invoked to remove an item
 * @property {Function} $render invoked when there external changes made to the list's model
 *
 * @property {Array} $buffers an list of `Buffer` Nodes
 * @property {Scope} $defaults the parent scope for all Item Nodes
 * @property {Scope} $bufferDefaults the parent scope for all Buffer Nodes
 * @property {Function} $getItems Return's the list of item nodes only (Excludes buffers)
 *
 * @description
 *
 * `NuListController` provides API for the `nu-list` directive. The controller contains
 * services for data-binding, DOM rendering of Items using the `$itemCompiler` resulted Node.
 *
 */
var NuListController  = ['$scope', '$element', '$exceptionHandler', '$attrs', '$compile', '$parse',
    function($scope, $element, $exceptionHandler, $attrs, $compile, $parse) {
    var nuList = this,
      itemNodes = [],
      rawElement = $element[0],
      children = rawElement.children,
      capacity = parseInt($attrs.capacity) || 10,
      model = $attrs.nuList || $attrs.src,
      modelGet = $parse(model),
      modelSet = modelGet.assign,
      internalChange = false,
      min = parseInt($attrs.min),
      max = parseInt($attrs.max),
      appendItem = function(node) {
        return rawElement.insertBefore(node, nuList.$buffers[0]);
      };

  this.$dirty = false;
  this.$pristine = true;
  this.$viewValue = [];
  this.$modelValue = Number.NaN;
  this.$render = noop;
  this.$name = $attrs.name;
  this.$buffers = [];
  this.$parsers = [];
  this.$formatters = [];

  this.$defaults = extend($scope.$new(), {
    '$erase': function() {
      nuList.$removeItem(this.item);
    }
  });
  this.$bufferDefaults = extend($scope.$new(), {
    '$append': function(item) {
      nuList.$itemNodeFactory(
          {'item' : item, '$index': nuList.$viewValue.length});
      nuList.$updateViewValue(nuList.$viewValue.push(item));
    },
    '$update': function(index, item) {
      angular.element(children[index]).scope().item = item;
      nuList.$updateViewValue(nuList.$viewValue[index] = item);
    }
  });

  this.$getItems = function() { return Array.prototype.slice.call(children, 0); };
  
  $element.addClass(PRISTINE_CLASS);

  $scope.$watch(function(scope) {
    if( !internalChange ) {
      var value = modelGet(scope);
      
      nuList.$modelValue = value;

      var idx = nuList.$formatters.length;
      while(idx--) {
        value = nuList.$formatters[idx](value);
      }

      if(isDefinedAndNotNull(value)) { nuList.$viewValue = value; }
      else { nuList.$viewValue.splice(0); }
      itemNodes = nuList.$getItems();
      nuList.$render();
      angular.element(itemNodes.splice(capacity - 1)).remove();
      angular.element(itemNodes).css('display', 'none');
    }
    internalChange = false;
  });

  this.$itemCompiler = $compile('<span class="list item erase" ng-click="$erase(item)">{{item}}</span>');

  this.$itemNodeFactory = function(scopeExtend) {

    var itemNode = angular.element(itemNodes.shift() || nuList.$itemCompiler(
      nuList.$defaults.$new(),
      function(itemNode) {
        appendItem(itemNode[0]);
      })
    );
    extend(itemNode.scope(), scopeExtend);
    return itemNode.css('display', '');
  };

  this.$removeItem = function(item) {
    var index = this.$viewValue.indexOf(item);
    if(children.length > index) {
      nuList.$viewValue.splice(index, 1);
      angular.element(children[index]).css('display', 'none');
      appendItem(children[index]);
      itemNodes.push(children[index]);
    }
    nuList.$updateViewValue();
  };

  this.$setDirty = function() {
    nuList.$pristine = false;
    nuList.$dirty = true;
    $element.removeClass(PRISTINE_CLASS).addClass(DIRTY_CLASS);
  };

  this.$setPristine = function() {
    nuList.$pristine = true;
    nuList.$dirty = false;
    $element.removeClass(DIRTY_CLASS).addClass(PRISTINE_CLASS);
  };

  this.$updateViewValue = function() {
    if (nuList.$pristine) { nuList.$setDirty(); }
    if(modelSet) {
      internalChange = true;
      var value = nuList.$viewValue;
      forEach(nuList.$parsers, function(fn) { value = fn(value); });
      modelSet($scope, value);
    }
  };
}];

/**
 * @ngdoc service
 * @name nu.listBuffers
 * @object
 *
 * @property {function(type, linkFn)} type create or retrive an `Buffer` link function
 * @property {function(templateStr, scope)} compile compile an `Buffer` 
 *    template using `$compile` and return it
 *
 * @description
 * This service is used to help compile an `nuList > Buffer` template into an node based on
 * `type` attribute
 */
nuList.service('listBuffers', function() {
    var NuListBufferTypes = {};

  NuListBufferTypes.txt = function TextListBuffer(bufferNode, $scope) {
    bufferNode.attr('contenteditable', 'true');
    bufferNode.on('keydown', function(event) {
      var keyCode = (event.which || event.keyCode);
      if (keyCode === 13) {
        var item = trim(this.innerHTML).replace(/<br\/?>/gi, '');
        this.innerHTML = '';
        event.preventDefault();
        if (item) {
          $scope.$apply(function(scope) {
            scope.$append(item);
          });
        }
      }
    }).html('');
  };

  NuListBufferTypes.file = function ImageListBuffer(bufferNode, $scope) {
    var input = bufferNode.find('input');
    input.on('change', function(event) {
      var files = event.target.files;
      if(files.length > 0) {
        event.preventDefault();
        $scope.$apply(function(scope) {
          for(var i = 0; i < files.length; i++) {
            scope.$append(files[i]);
          }
        });
        this.value = '';
      }
    });
  };

  NuListBufferTypes.default = noop;

  this.compile = function NuListBufferCompiler(templateStr, $scope) {

    var bufferNode = angular.element(templateStr.replace(/(<\/?)buffer/gi, '$1span')),
        bufferType = bufferNode.attr('type') || 'default';
    if( !NuListBufferTypes[bufferType] ) { bufferType = 'default'; }
    NuListBufferTypes[bufferType](bufferNode, $scope);
    return bufferNode;
  };

  this.type = function(type, fn) {
    if(fn) { NuListBufferTypes[type] = fn; }
    return NuListBufferTypes[type];
  };
});

/**
 * @ngdoc directive
 * @name nu:nuList
 *
 * @restrict EACM
 * @element ANY
 * @priority 500
 * @param {string} nuList Assignable angular expression to data-bind to.
 * @param {string} src Assignable angular expression to data-bind to this is used in case `nuList` is not present.
 * @param {number} capacity Optional the number of `itemNode`'s to be Pooled for re-use. Default value is 10
 * @param {number} min - Not yet implemented
 * @param {number} max - Not yet implemented
 *
 * @description
 *
 * The `nuList` directive instantiates a template once per item from a collection. Each template
 * instance gets its own scope, where the given loop variable is set to the current collection item,
 * `$index` is set to the item index or key, and `$erase` is a function on invocation would remove the
 * item from the collection and update the view respectively.
 *
 <doc:example>
   <doc:source src="css" type="less">
   </doc:source>
   <doc:source src="html" type="html">
   </doc:source>
   <doc:source src="js" type="js">
   </doc:source>
 </doc:example>
 *
 */
nuList.directive('nuList', ['$compile', '$parse', 'listBuffers',
  function($compile, $parse, listBuffers) {
        return {
      terminal: true,
      priority: 95,
      template: '<div class="nu list"></div>',
      replace: true,
      transclude: 'element',
      restrict: 'EACM',
      controller: NuListController,
      link: function(scope, element, attrs, nuList, transcludeFn) {
        var template = transcludeFn();
        template.scope().$destroy();
        /* INFO: an hack to expose the controller, as the internal
         * mechanism of angular is not handling it properly as expected
         */
        element.data('$nuListController', nuList);
        var buffers = template.find('buffer').remove(),
            itemTemplate = trim(template.html()),
            children = element[0].children;

        if(itemTemplate) {
          if( !startsWith(itemTemplate, '<') ) {
            itemTemplate = '<span ng-click="$erase(item)">' + itemTemplate + '</span>';
          }

          nuList.$itemCompiler = $compile(itemTemplate);
        }


        if(buffers.length > 0) {
          if( buffers.find('buffer').length > 0 ) {
            throw nuError('list', 'Nested buffers are not allowed');
          }

          angular.forEach(buffers, function(bufferTemplate) {
            var bufferScope = nuList.$bufferDefaults.$new(),
                bufferNode = $compile( listBuffers.compile(
                  trim(bufferTemplate.outerHTML), bufferScope ) )(bufferScope)
                  .addClass('buffer');
            
            nuList.$buffers.push(bufferNode[0]);
          });

          element.append(nuList.$buffers);

          nuList.$getItems = function() {
            return Array.prototype.slice.call(children, 0, -buffers.length);
          };
        }

        var eraseNode = function() { nuList.$removeItem(this.item); };

        attrs.$observe('readonly', function(value){
          nuList.$defaults.$erase =
            (value === 'readonly' || value === 'true')? noop : eraseNode;
          if(nuList.$defaults.$erase !== noop) { element.attr('readonly', ''); }
        });

        attrs.$observe('buffer', function(value){
          var bufferNodes = angular.element(nuList.$buffers);
          if( value === 'false' ) {
            bufferNodes.addClass('hidden-buffer');
          } else { bufferNodes.removeClass('hidden-buffer'); }
        });

        if(nuList.$buffers[0]) {
          element.on('click', function() {
            nuList.$buffers[0].focus();
          });
        }

        nuList.$render = function() {
          forEach(nuList.$viewValue, function(item, index) {
            nuList.$itemNodeFactory({'item' : item, '$index': index});
          });
        };
      }
    };
  }
]);


var nuPressButton = angular.module('nu.PressButton', ['nu.Event']);

nuPressButton.directive('nuPressButton', ['nuEvent', '$parse',
  function(nuEvent, $parse) {
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
      priority: 5,
      link: function(scope, element, attrs, ngModel) {
        var icon = attrs.nuPressButton || attrs.icon,
            label = element.find('label');

        angular.element(label[1]).attr('class',
          (icon? icon : '') + (attrs.on? ' ' + attrs.on : ''));

        angular.element(label[0]).attr('class',
          (icon? icon : '') + (attrs.off? ' ' + attrs.off : ''));

        initTwoStateSwtich(scope, element, attrs, ngModel,
          nuEvent(scope, attrs), $parse(attrs.ngModel)(scope));
      }
    };
  }


]);


var nuSwitch = angular.module('nu.Switch', ['nu.Event']);

nuSwitch.directive('nuSwitch', ['nuEvent', '$parse',
  function(nuEvent, $parse) {
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
      priority: 5,
      link: function(scope, element, attrs, ngModel) {
        var label = element.find('label');

        label.text(attrs.on? attrs.on : 'On');
        label.attr('label-off', attrs.off? attrs.off : 'Off');

        initTwoStateSwtich(scope, element, attrs, ngModel, 
          nuEvent(scope, attrs), $parse(attrs.ngModel)(scope));
      }
    };
  }
]);


var nuFileChooser = angular.module('nu.FileChooser', ['nu.List', 'nu.Event', 'nu.Media']);

nuFileChooser.filter('basename', function() {
    return function(blob) {
    if( isFile(blob) ) { blob = blob.name; }
    if( isString(blob) ) { return path.basename(blob); }
    return blob;
  };
});

nuFileChooser.filter('pathExt', function() {
    return function(blob) {
    if( isFile(blob) ) { blob = blob.name; }
    if( isString(blob) ) { return lowercase(path.splitext(blob)[1]).substr(1); }
    return blob;
  };
});

nuFileChooser.directive('nuFileChooser', ['$compile', 'listBuffers', 'nuEvent',
  function($compile, listBuffers) {
        var item_tmpl = '<span class="list item" ext="{{item|pathExt}}" ng-click="$erase()">' +
          '{{item|basename}}' +  '</span>';
    var buffer_tmpl = '<label class="buffer" type="file"><span class="action">Browse<input type="file"></span></label>';

    return {
      restrict: 'AC',
      require: 'nuList',
      priority: 99,
      link: function(scope, element, attrs, nuList) {

        var rawElemenet = element[0],
            children = rawElemenet.children,
            bufferScope = nuList.$bufferDefaults.$new(),
            bufferNode,
            isMultiple = element.hasClass('multiple'),
            itemRawNode = angular.element(item_tmpl);
        
        if(nuList.$buffers.length === 0) {
          bufferNode = $compile( listBuffers.compile(
              trim(buffer_tmpl), bufferScope ) )(bufferScope);
          nuList.$buffers.push(bufferNode[0]);
        } else { bufferNode = angular.element(nuList.$buffers[0]); }

        nuList.$itemCompiler = $compile(itemRawNode);
        element.append(nuList.$buffers).addClass('file');

        nuList.$getItems = function() {
          return Array.prototype.slice.call(children, 0, -1);
        };

        var input = bufferNode.find('input');

        if( !isMultiple ) {
          element.addClass('single');
          element.on('click', function() {
            input[0].click();
          });

          nuList.$formatters.push(function(value) {
            if( value && !isArray(value) ) { return [value]; }
            return value;
          });

          nuList.$parsers.push(function(value) { return value[0]; });
        } else {
          itemRawNode.addClass('erase');
          input.attr('multiple', 'multiple');
        }

        bufferNode.on('click', function() {
          event.stopPropagation();
        });

        var appendItem = nuList.$bufferDefaults.$append;
        nuList.$bufferDefaults.$append = function(item) {
          if(isMultiple || !isMultiple && (nuList.$viewValue.length === 0)) {
            appendItem(item);
          } else if(!isMultiple) { nuList.$bufferDefaults.$update(0, item); }
        };
      }
    };
  }
]);


var nuShow = angular.module('nu.Show', []);

nuShow.directive('nuShow', [
  function() {
        var setActive = function() {
      angular.element(arguments).toggleClass('active');
      return arguments[arguments.length - 1];
    };

    return {
      template: '<div class="nu show">' +
        '<a class="navigation right"><div class="arrow right"></div></a>' +
        '<a class="navigation left"><div class="arrow left"></div></a></div>',
      restrict: 'EACM',
      replace: true,
      require: '?ngModel',
      transclude: true,
      link: function(scope, element, attrs, ngModel, transcludeFn) {
        var imgs, active, transcludes = [], rawElement = element[0];

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

var nuSlider = angular.module('nu.Slider', []);

nuSlider.service('_ScrollSize', ['$window', function($window) {
    var height, width, sliders = [],
  scrollNode = angular.element(
    '<div style="width:100px;height:100px;overflow:scroll;">' +
      '<div style="width:200px;height:200px;"></div>' +
    '</div>');
  
  var calcDimension = function(element, frame) {
    var rawElement = element[0],
        rawFrame = frame[0];
    if(rawFrame.offsetWidth >= rawElement.clientWidth && !element.css('height')) {
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

nuSlider.directive('nuSlider', ['_ScrollSize',
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
      link: function(scope, element, attrs, ngController, transcludeFn) {
        var frame = element.css('overflow','hidden').find('div');
        frame.append(transcludeFn());
        scrollSize.hideBars(element, frame);
      }
    };
  }
]);



var nuEvent = angular.module('nu.Event', []);

nuEvent.service('nuEvent', ['$parse', function($parse) {
    var nuPartialEvent = function(fn, $scope) {
    return function nuPartialEvent(event) {
      fn($scope, {'$event': event});
      $scope.$digest();
    };
  };

  var nuEventCreator = function(scope, attrs, events) {
    var NuEventController = function($scope, $attrs, $events) {
      $events = $events || 'change click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste ';
      NuEventManager.call(this);
      forEach($attrs, function(value, name) {
        if( isString(name) ) {
          if( startsWith(name, 'nu') ) {
            var eventName = name.substr(2).toLowerCase();
            if($events.indexOf(eventName + ' ') !== -1) {
              this.on(eventName, nuPartialEvent($parse(value), $scope));
            }
          }
        }
      }, this);
    };

    extend(NuEventController.prototype, NuEventManager.prototype);

    return new NuEventController(scope, attrs);
  };

  return nuEventCreator;
}]);

var nuSrc = angular.module('nu.Src', []);

nuSrc.directive('nuSrc', [
  function() {
        return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
        scope.$watch(attrs.nuSrc, function(value) {
          if( isString(value) ) {
            attrs.$set('src', value);
          } else if (window.File && window.FileReader &&
                value.name && value.lastModifiedDate) {

            var reader = new FileReader();
            reader.readAsDataURL(value);
            reader.onload = function(evt) {
              attrs.$set('src', evt.target.result);
            };
          }
        });
      }
    };
  }
]);



var nuWrap = angular.module('nu.Wrap', []);

var WRAP_EDITOR_CLASS = 'ws-view',
    WRAP_VIEW_CLASS = 'ws-edit';

nuWrap.run(['$templateCache', function($templateCache) {
    $templateCache.put('nu.wrap.default',
    '<div>' +
      '<wrap-view>{{$model$}}</wrap-view>' +
      '<wrap-in></wrap-in>' +
    '</div>');
}]);

var SimpleModelCtrl = function(input, wrapView) {
    var ctrl = this;

  input.on('keydown', function(event) {
    var key = (event.which || event.keyCode);
    if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)){ return; }
    ctrl.$toAccept = true;
  });

  this.$accept = function() {
    ctrl.$viewValue = input.val();
    wrapView.html(ctrl.$viewValue || input.attr('placeholder'));
    ctrl.$toAccept = false;
  };

  this.$reset = function() {
    input.val(wrapView.html() !== input.attr('placeholder')?
        wrapView.html() : '');
    ctrl.$toAccept = false;
  };

  this.isSimple = true;
  this.$valid = true;
};

var nullWrapSetCtrl = {
  $template: 'nu.wrap.default'
};

var nullFormCtrl = {
  $setDirty: noop
};

nuWrap.directive('nuWrap', ['$templateCache', '$parse', '$compile', '$exceptionHandler', '$animate',
  function ($templateCache, $parse, $compile, $exceptionHandler, $animate) {
        return {
      restrict: 'AC',
      require: ['?ngModel', '^?form', '^?wrapset'],
      priority: 10,
      link: function(scope, element, attrs, ctrls) {
        var rawElement = element[0],
            wrapView = angular.element('<a class="w-view show-view"></a>'),
            modelCtrl = ctrls[0] || new SimpleModelCtrl(element, wrapView, actionScope),
            formCtrl = ctrls[1] || nullFormCtrl,
            wrapset = ctrls[2] || nullWrapSetCtrl,
            actionScope = scope.$new(true);

        var wrap = angular.element(
            $templateCache.get(attrs.nuWrap || wrapset.$template) );
        
        if(wrap.length > 1) {
          wrap = angular.element('<div></div>').append(wrap);
        }
        
        wrap.addClass('nu wrap ws-view');


        wrapView.html(
          (wrap.find('wrap-view').html() || '{{$model$}}' )
            .replace('$model$', '$viewValue'));

        if( !wrap.find('wrap-view').replaceWith(wrapView).length ) {
          wrap.prepend(wrapView);
        }

        var placeHolderNode = nodes.append.text(wrapView[0], '');

        $compile(wrap)(actionScope);

        element.addClass('show-editor w-edit');
        /* INFO: Why not use replaceWith? - because it daloc all 
         * the events & data which here we need to keep them
         */
        rawElement.parentNode.replaceChild(wrap[0], rawElement);
        wrap[0].replaceChild(rawElement, wrap.find('wrap-in')[0]);

        var validatePlaceHolder = function(canShow) {
          var holderText = element.attr('placeholder');
          placeHolderNode.nodeValue = holderText && canShow? holderText : '';
        };

        modelCtrl.$toAccept = false;

        if( isFunction(modelCtrl.$setViewValue) ) {
          var ngModelGet = $parse(attrs.ngModel),
              ngModelSet = ngModelGet.assign;

          actionScope.$valid = modelCtrl.$valid;
          actionScope.$error = modelCtrl.$error;
          actionScope.$viewValue = modelCtrl.$viewValue;
          actionScope.$modelValue = modelCtrl.$modelValue;

          var watch = getngModelWatch(scope, modelCtrl,
            ngModelGet(scope), ngModelSet),
              viewStateStore = false;

          if(watch) {
            watch.get = function nuWrapModelWatch(scope) {
              if( modelCtrl.$toAccept ) { return watch.last; }
              var value = watch.exp(scope);
              actionScope.$viewValue = modelCtrl.$viewValue;
              actionScope.$modelValue = modelCtrl.$modelValue;
              validatePlaceHolder(!modelCtrl.$viewValue ||
                modelCtrl.$viewValue === '');
              return value;
            };
          }

          modelCtrl.$setViewValue = function(value) {
            modelCtrl.$viewValue = value;
            modelCtrl.$toAccept = true;


            if (modelCtrl.$pristine) {
              modelCtrl.$dirty = true;
              modelCtrl.$pristine = false;
              $animate.removeClass(element, PRISTINE_CLASS);
              $animate.addClass(element, DIRTY_CLASS);
              formCtrl.$setDirty();
            }

            forEach(this.$parsers, function(fn) {
              value = fn(value);
            });
            
            actionScope.$viewValue = modelCtrl.$viewValue;
            modelCtrl.$modelValue = actionScope.$modelValue = value;
            actionScope.$valid = modelCtrl.$valid;
          };

          modelCtrl.$accept = function() {
            ngModelSet(scope, actionScope.$modelValue);
            forEach(modelCtrl.$viewChangeListeners, function(listener) {
              try {
                listener();
              } catch(e) {
                $exceptionHandler(e);
              }
            });
            modelCtrl.$toAccept = false;
            validatePlaceHolder(!modelCtrl.$viewValue ||
              modelCtrl.$viewValue === '');
          };

          modelCtrl.$reset = function() {
            modelCtrl.$toAccept = false;
            var value = watch.exp(scope);
            if( !value ) {
              modelCtrl.$viewValue = modelCtrl.$modelValue = value;
              element.val('');
            }
            actionScope.$viewValue = modelCtrl.$viewValue;
            actionScope.$modelValue = modelCtrl.$modelValue;
            actionScope.$valid = modelCtrl.$valid;
          };
        }

        validatePlaceHolder(!element.val());

        actionScope.reset = modelCtrl.$reset;
        actionScope.accept = modelCtrl.$accept;
        actionScope.show = function(viewState) {
          if(viewState !== viewStateStore) {
            if(!modelCtrl.$toAccept) {
              actionScope.resetValue = modelCtrl.$modelValue;
            }

            wrap
              .removeClass(viewState? WRAP_EDITOR_CLASS : WRAP_VIEW_CLASS)
              .addClass(viewState? WRAP_VIEW_CLASS : WRAP_EDITOR_CLASS);
            viewStateStore = viewState;
          }
        };

        var keyDownHandler = function(event) {
          try {
            var keyCode = (event.which || event.keyCode);
            if( (keyCode === 13 && !event.ctrlKey) || keyCode === 27 ) {
              if ( !modelCtrl.$valid || keyCode === 27 ) {
                modelCtrl.$reset();
              } else { modelCtrl.$accept(); }
              scope.$digest();
              actionScope.show(false);
            }
          } catch (e) { $exceptionHandler(e); }
        };

        element.on('keydown', function(event) {
          try {
            var keyCode = (event.which || event.keyCode);
            if( (keyCode === 13 && !event.ctrlKey) || keyCode === 27 ) {
              event.preventDefault();
            } else if ( !modelCtrl.$toAccept &&
              !( (15 < keyCode && keyCode < 19) || keyCode === 91 ) ) { 
              actionScope.show(true);
            }
          } catch (e) { $exceptionHandler(e); }
        });

        attrs.$observe('defaultNav', function(value) {

          element[(isUndefined(value) || toBoolean(value)? 'on' : 'off')]('keyup', keyDownHandler);
        });

        element.on('focus', function() {
          if( !modelCtrl.$toAccept ) { actionScope.show(true); }
        });

        wrapView.on('focus', function() {
          element.focus();
        });

        element.on('blur', function() {

          if( !modelCtrl.$toAccept ) { actionScope.show(false); }
        });

        wrapView.on('mousedown', function() {
          actionScope.show(true);
          setTimeout(function() { rawElement.focus(); }, 0);
        });
      }
    };
  }
]);

nuWrap.filter('asterises', function() {
    return function(input, asterisk) {
    if(input) {
      var output = '';
      for (var i = 0; i < input.length; i++) {
        output += asterisk || '\u2022';
      }
      return output;
    }
    return input;
  };
});

nuWrap.directive('wrapset', [
  function() {
        return {
      restrict: 'EAC',
      controller: ['$scope', '$element', '$attrs',
        function($scope, $element, $attrs) {
          this.$template = $attrs.wrapset || $attrs.tmpl;
      }]
    };
  }
]);

var nuWrapBS = angular.module('nu.Wrap.bs', []);

nuWrap.run(['$templateCache', function($templateCache) {
    /**
   * Show the input with an single addon showing ok/warning signs
   */
  $templateCache.put('nu.wrap.bs.status',
		'<div class="input-group">' +
		  '<wrap-in></wrap-in>' +
		  '<span class="input-group-addon show-editor">' +
		    '<span ng-class="{\'glyphicon-warning-sign\': !$valid, \'glyphicon-ok\': $valid}" class="glyphicon"></span>' +
		  '</span>' +
		'</div>');

  /**
   * Show the input with an two addion one for accept other for reset
   */
  $templateCache.put('nu.wrap.bs.acceptReject',
		'<div class="input-group">' +
		  '<wrap-in></wrap-in>' +
		  '<span class="input-group-addon show-editor" ng-click="$valid && accept(); show(!$valid);">' +
		    '<span class="glyphicon" ng-class="{\'glyphicon-warning-sign\': !$valid, \'glyphicon-ok\': $valid}"></span>' +
		  '</span>' +
		  '<span class="input-group-addon show-editor" ng-click="reset(); show(false);">' +
		    '<span class="glyphicon glyphicon-remove"></span>' +
		  '</span>' +
		'</div>');
}]);
var mimetypes = {};
mimetypes['audio'] = '.adp .au .snd .mid .midi .kar .rmi .mp4a .mpga .mp2 .mp2a .mp3 .m2a .m3a .oga .ogg .spx .s3m .sil .uva .uvva .eol .dra .dts .dtshd .lvp .pya .ecelp4800 .ecelp7470 .ecelp9600 .rip .weba .aac .aif .aiff .aifc .caf .flac .mka .m3u .wax .wma .ram .ra .rmp .wav .xm';
mimetypes['image'] = '.bmp .cgm .g3 .gif .ief .jpeg .jpg .jpe .ktx .png .btif .sgi .svg .svgz .tiff .tif .psd .uvi .uvvi .uvg .uvvg .sub .djvu .djv .dwg .dxf .fbs .fpx .fst .mmr .rlc .mdi .wdp .npx .wbmp .xif .webp .3ds .ras .cmx .fh .fhc .fh4 .fh5 .fh7 .ico .sid .pcx .pic .pct .pnm .pbm .pgm .ppm .rgb .tga .xbm .xpm .xwd';
mimetypes['video'] = '.3gp .3g2 .h261 .h263 .h264 .jpgv .jpm .jpgm .mj2 .mjp2 .mp4 .mp4v .mpg4 .mpeg .mpg .mpe .m1v .m2v .ogv .qt .mov .uvh .uvvh .uvm .uvvm .uvp .uvvp .uvs .uvvs .uvv .uvvv .dvb .fvt .mxu .m4u .pyv .uvu .uvvu .viv .webm .f4v .fli .flv .m4v .mkv .mk3d .mks .mng .asf .asx .vob .wm .wmv .wmx .wvx .avi .movie .smv';

function typeOfExt(type) {
  return function isTypeOf(ext) {
    return (ext[0] === '.' && mimetypes[type].indexOf(ext) !== -1);
  };
}

var isAudioByExt = typeOfExt('audio');
var isImageByExt = typeOfExt('image');
var isVideoByExt = typeOfExt('video');


var nuMedia = angular.module('nu.Media', []);

nuMedia.service('nuMedia', ['$q',
    function($q) {
    var NUMedia = function(type) {
    var $el = this.$el = angular.element('<' + type + '/>');
    var el = this.el = $el[0];

    this.available = !!el.canPlayType;
    
    angular.element(document.body).append($el.css('display', 'none'));


    this.toSource = function(blob, timeRange) {
      if( lowercase(blob.tagName) === 'source' ) {
        return blob;
      }
      
      var uri, type;
      if( isFile(blob) ) {
        if( !el.canPlayType(blob.type) ) { return; }
        uri = URL.createObjectURL(blob);
        type = blob.type;
      }
      if ( isObject(blob) && blob.src ) {
        if(blob.type) {
          uri = blob.src;
          type = blob.type;
        } else { blob = blob.src; }
      }
      if ( isString(blob) ) { uri = blob; }


      if(timeRange) { uri += '#t=' + timeRange; }

      if(uri) {
        var source = angular.element('<source/>').attr('src', uri);
        if(type) { source.attr('type', type); }
        return source;
      }
    };

    var nuMedia = this;
    function notify(name, data) {
      if(nuMedia.$deferred.notify) {
        var eventObj = {}; eventObj[name] = data;
        nuMedia.$deferred.notify(eventObj);
      }
    }


    
    $el.on('error emptied abort', function() {});

    $el.on('loadedmetadata', function() {
      nuMedia.$deferred.promise.media = {
        'duration': nuMedia.el.duration,
        'uri': nuMedia.$el.find('source').attr('src')
      };


    });
    
    this.onStop = function onMediaStopOrEnd() {
      var target = nuMedia.current,
          completed = (nuMedia.el.currentTime === nuMedia.el.duration);

        if(nuMedia.$deferred && nuMedia.$deferred.promise.media &&
          startsWith(nuMedia.$deferred.promise.media.uri, 'blob:')) {
        URL.revokeObjectURL(nuMedia.$deferred.promise.media.uri);
      }
      nuMedia.current = null;
      

      nuMedia.$el.attr('src', '').removeAttr('src').html('');
      if(nuMedia.$deferred.resolve) {
        nuMedia.$deferred.resolve({
          'end': {
            'target': target,
            'completed': completed
          }
        });
      }
    };

    $el.on('ended', this.onStop);
    
    $el.on('timeupdate durationchange', function(event) {
      notify('duration', {
        duration: event.target.currentTime,
        currentTime: event.target.duration,
        progress: (event.target.currentTime / event.target.duration)
      });
    });
  };




  NUMedia.prototype.play = function(src, timeRange) {
    if( this.current === src || (isUndefined(src) && this.el.duration) ) {
      this.el.play();
      return this.$deferred.promise;
    }

    var source;
    if( isFile(src) || isString(src) ) {
      source = this.toSource(src, timeRange);
    } else if ( isObject(src) ) {
      for(var index in src) {
        source = this.toSource(src[index], timeRange);
        if( source ) { break; }
      }
    }

    if(source) {
      this.stop();
      this.$deferred = $q.defer();
      this.$el.append(source);
      this.el.play();
      this.current = src;
    }
    return this.$deferred.promise;
  };
  
  NUMedia.prototype.pause = function() {
    if(this.el.duration) {
      this.el.pause();
      return this.current;
    }
  };
  
  NUMedia.prototype.stop = function() {
    if(this.el.duration) {
      this.pause();
      this.onStop();
    }
  };
  
  NUMedia.prototype.seek = function(timeRange) {};
  NUMedia.prototype.canPlay = function(blod) {
    return this.el.canPlayType(blod.type || blod);
  };

  var audio = new NUMedia('audio'),
      video = new NUMedia('video'),
      result = {'audio': audio, 'video': video};
  
  result.typeOf = function(blob) {
    if( isFile(blob) ) {
      if( startsWith(blob.type, 'audio') ) { return 'audio'; }
      else if( startsWith(blob.type, 'video') ) { return 'audio'; }
      else if( startsWith(blob.type, 'image') ) { return 'image'; }
      blob = blob.name;
    }
    if ( isString(blob) ) {
      var ext = path.splitext(blob)[1];
      if(ext) {
        for(var mediaType in mimetypes) {
          if(ext[0] === '.' && mimetypes[mediaType].indexOf(ext) !== -1) {
            return mediaType;
          }
        }
      }
    }
  };
  return result;
}]);

nuMedia.run(['$templateCache',
      function($templateCache) {
        $templateCache.put('nu.button.view.icon.coin',
      '<div class="icon play"><div class="icon-inner"></div></div>'
    );
    $templateCache.put('nu.button.view.progress.coin',
      '<div class="progress"><div class="progress-inner"></div></div>'
    );

    $templateCache.put('nu.button.view.icon.box',
      '<div class="icon play"><div class="icon-inner"></div></div>'
    );
    $templateCache.put('nu.button.view.progress.box',
      '<div class="progress"><div class="progress-inner"></div></div>'
    );
  }
]);


var nuButtonView = angular.module('nu.ButtonView', ['nu.Media']);

nuButtonView.service('nuButtonViewTypes', ['$templateCache',
  function($templateCache) {
        var buttonCtrlBase = {
      setIcon: function(name) {
        this.removeIcon();
        if(name) { this.el.icon.addClass(name); }
      },
      removeIcon: function() {
        this.el.icon.removeClass('image replay play pause stop');
      },
      progressReset: function() {
        this.progressUpdate({duration: {progress: 0}});
      }
    };

    var nuButtonViewTypes = {
      'coin': function(element) {
        this.el = {};
        this.el.icon = angular.element(
              $templateCache.get('nu.button.view.icon.coin') );
        this.el.progress = angular.element(
              $templateCache.get('nu.button.view.progress.coin') );
        var ctrl = this;

        element.append(this.el.icon).append(this.el.progress);

        this.progressUpdate = function(evt) {
          if(evt.duration) {
            var position = 'rotate(' + (evt.duration.progress + 0.12) + 'turn)';
            ctrl.el.progress.css({
              '-webkit-transform': position,
              '-moz-transform': position,
              'transform': position
            });
          }
        };
      },
      'box': function(element) {
        this.el = {};
        this.el.icon = angular.element(
              $templateCache.get('nu.button.view.icon.box') );
        this.el.progress = angular.element(
              $templateCache.get('nu.button.view.progress.box') );
        var ctrl = this;

        element.append(this.el.icon).append(this.el.progress);
        var rawProgress = this.el.progress[0];

        this.progressUpdate = function(evt) {
          if(evt.duration) {
            ctrl.el.progress.css('box-shadow',
              'inset ' + Math.floor(rawProgress.clientWidth * evt.duration.progress) +
              'px 0px 0px 0px rgba(53, 126, 189, 0.5)');
          }
        };
      },
      'fcbox': function(element) {
        this.el = {};
        this.el.icon = angular.element(
              $templateCache.get('nu.button.view.icon.box') );
        this.el.progress = element.parent();
        var ctrl = this;

        element.append(this.el.icon);
        var rawProgress = this.el.progress[0];

        this.progressUpdate = function(evt) {
          if(evt.duration) {
            ctrl.el.progress.css('box-shadow',
              'inset ' + Math.floor(rawProgress.clientWidth * evt.duration.progress) +
              'px 0px 4px 0px rgba(53, 126, 189, 1)');
          }
        };

        this.progressReset = function() {
          ctrl.el.progress.css('box-shadow', 'none');
        };
      }
    };

    extend(nuButtonViewTypes.coin.prototype, buttonCtrlBase);
    extend(nuButtonViewTypes.box.prototype, buttonCtrlBase);
    extend(nuButtonViewTypes.fcbox.prototype, buttonCtrlBase);

    var result = {
      bind: function(type, element) {
        return new nuButtonViewTypes[type](element);
      },
      defaultIcon: {
        audio: 'play', image: 'image'
      }
    };

    result.defaultIcon.video = result.defaultIcon.audio;
    return result;
  }
]);

nuButtonView.directive('nuButtonView', ['nuMedia', 'nuButtonViewTypes',
  function(nuMedia, nuButtonViewTypes) {
        var _template =
      '<div class="nu button view">' +
        '<input type="radio" style="display: none;"/>' +
      '</div>';

    return {
      template: _template,
      restrict: 'EACM',
      replace: true,
      require: '?ngModel',

      link: function(scope, element, attrs, ngModel) {
        var type = attrs.nuButtonView || 'coin',
            typeCtrl = nuButtonViewTypes.bind(type, element),
            mediaType,
            isPlaying = false,
            isMedia = false,
            isImage = false;

        element.addClass(type);

        function mediaEnd(evt) {
          if( isPlaying ) {
            if(evt.end) {
              typeCtrl.setIcon(evt.end.completed? 'replay' : 'play');
              typeCtrl.progressReset();
            }
            isPlaying = false;
          }
        }
        
        function playPause() {
          if(isPlaying) {  nuMedia.audio.pause(); }
          else { nuMedia.audio.play(ngModel.$viewValue).then(
            mediaEnd, mediaEnd, typeCtrl.progressUpdate); }
          isPlaying = !isPlaying;
          typeCtrl.setIcon(isPlaying? 'pause' : 'play');
        }

        function showImage() {}

        ngModel.$render = function() {
          if(isPlaying && nuMedia[mediaType]) {
            nuMedia[mediaType].stop();
          }
          typeCtrl.progressReset();

          mediaType = nuMedia.typeOf(ngModel.$viewValue);
          if( isDefinedAndNotNull(mediaType) ) {
            isMedia = isImage = false;
            isImage = mediaType === 'image';
            isMedia = !isImage;
          }

          typeCtrl.setIcon(nuButtonViewTypes.defaultIcon[mediaType]);
        };

        element.on('click', function() {
          if(isMedia) { playPause(); }
          else if(isImage) { showImage(); }
          event.stopPropagation();
        });
      }
    };
  }
]);

var nu = angular.module('nu', 
  ['nu.Switch', 'nu.PressButton', 'nu.List', 'nu.FileChooser', 	
    'nu.Show', 'nu.Src', 'nu.Slider', 'nu.Wrap']);
})(angular);