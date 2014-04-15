/*global angular, noop, trim, startsWith, forEach, extend, nuError, PRISTINE_CLASS, DIRTY_CLASS: true*/
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
  'use strict';
  var nuList = this,
      itemNodes = [],
      rawElement = $element[0],
      children = rawElement.children,
      capacity = parseInt($attrs.capacity) || 10, // Pool Capacity
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
      // TODO: need to find an alternative for this
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
    // There is an memory leek here because of $compile clone function
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
  'use strict';
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
    //INFO: Replace the tag name buffer with span
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
    'use strict';
    return {
      terminal: true,
      priority: 99, // 500 If Priority crosses 500 {{template}} system is now working
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
//element.removeClass(DIRTY_CLASS).addClass(PRISTINE_CLASS);
        //INFO: Append Buffers, if Any
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
