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
var move = {},
    random = {},
    noop = angular.noop,
    copy = angular.copy,
    equals = angular.equals,
    forEach = angular.forEach,
    isString = angular.isString,
    isElement = angular.isElement,
    extend = angular.extend,
    nuError = angular.$$minErr('nu'),
    isDefinedAndNotNull = function(value) {
      return typeof value != 'undefined' && value !== null;
    },
    trim = function(str) {
      return isString(str)? str.replace(/^\s+|\s+$/g, '') : '';
    },
    partial = function(fn, args, scope) {
      return function() {
        return fn.apply(scope, args.concat(Array.prototype.slice.call(arguments, 0)));
      };
    },
    startsWith = function(str, subStr) {
      return isString(str) && isString(subStr) && str.indexOf(subStr) === 0;
    };

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
  this.$viewValue = Number.NaN;
  this.$modelValue = Number.NaN;
  this.$render = noop;
  this.$name = $attrs.name;
  this.$buffers = [];
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
    }
  });

  this.$getItems = function() { return Array.prototype.slice.call(children, 0); };
  
  $scope.$watchCollection(model, function(modelValue) {
    if(!modelValue) {
      if(modelSet) { modelSet($scope, []); return; }
      nuList.$viewValue = [];
      return;
    }

    if( !internalChange ) {

      nuList.$viewValue = nuList.$modelValue = modelValue;
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
      modelSet($scope, nuList.$viewValue);
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
      priority: 99,
      template: '<div class="nu list"></div>',
      replace: true,
      transclude: 'element',
      restrict: 'EACM',
      controller: NuListController,
      link: function(scope, element, attrs, nuList, transcludeFn) {
        var template = transcludeFn();
        template.scope().$destroy();
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

nuPressButton.directive('nuPressButton', ['nuEvent',
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

        move.attribute(input, element, ['type', 'name', 'checked']).attr('id', id);
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

        input.on('change', function pbChange(event) {
          var isChecked = this.checked;
          event.stopPropagation();
          if( ngModel && (this.type !== 'radio' || isChecked) ) {
            scope.$apply(function() {
              ngModel.$setViewValue(isChecked);
            });
          }

          Event.trigger('change', {'target': attrs.name, 'value': parser(isChecked)});
        });


      }
    };
  }


]);


var nuSwitch = angular.module('nu.Switch', ['nu.Event']);

nuSwitch.directive('nuSwitch', ['nuEvent',
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

        move.attribute(input, element, ['type', 'name', 'checked']).attr('id', id);
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

        input.on('change', function(event) {
          var isChecked = this.checked;
          event.stopPropagation();
          if( ngModel && (this.type !== 'radio' || isChecked) ) {
            scope.$apply(function() {
              ngModel.$setViewValue(isChecked);
            });
          }
          Event.trigger('change', {'target': attrs.name, 'value': parser(isChecked)});
        });


      }
    };
  }
]);


var nuFileChooser = angular.module('nu.FileChooser', ['nu.Event']);

nuFileChooser.directive('nuFileChooser', ['nuEvent',
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


        input.on('change', function(event) {
          var eventBase = {'target': attrs.name};
          if( event.currentTarget.files.length > 0 ) {
            var file = event.currentTarget.files[0];
            if(ngModel) {
              scope.$apply(function() {
                ngModel.$setViewValue(file);
              });
            }
            name.html(nameOnly(file));
            eventBase.value = event.currentTarget.files;
          }
          Event.trigger('change', eventBase);
        });


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



var nuEvent = angular.module('nu.Event', []);

nuEvent.service('nuEvent', ['$parse', function($parse) {
    var nuPartialEvent = function(fn, $scope) {
    return function nuPartialEvent(event) {
      fn($scope, {'$event': event});
      $scope.$digest();
    };
  };

  var nuEventCreator = function(scope, attrs) {
    var NuEventController = function($scope, $attrs) {
      NuEventManager.call(this);
      forEach($attrs, function(value, name) {
        if( isString(name) ) {
          if( startsWith(name, 'nu') ) {
            this.on(name.substr(2).toLowerCase(), nuPartialEvent($parse(value), $scope));
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

var nu = angular.module('nu', 
  ['nu.Switch', 'nu.PressButton', 'nu.List', 'nu.FileChooser', 
    'nu.Show', 'nu.Src', 'nu.Slider', 'nu.Event']);
})(angular);