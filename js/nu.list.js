/*global angular, nu, noop, equals, copy, trim, startsWith, forEach, extend, nuError: true*/
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
 * @property {Array} $getItems should return an array of Only Item Nodes (exclude's buffer nodes)
 *
 * @description
 *
 * `NuListController` provides API for the `nu-list` directive. The controller contains
 * services for data-binding, DOM rendering of Items using the `$itemCompiler` resulted Node.
 *
 */
var NuListController  = ['$scope', '$element', '$exceptionHandler', '$attrs', '$compile',
    function($scope, $element, $exceptionHandler, $attrs, $compile) {
  'use strict';
  var nuList = this,
      itemNodes = [],
      rawElement = $element[0],
      children = rawElement.children,
      capacity = parseInt($attrs.capacity) || 10, // Pool Capacity
      model = $attrs.nuList || $attrs.src,
      min = parseInt($attrs.min),
      max = parseInt($attrs.max),
      appendItem = function(node) {
        return rawElement.insertBefore(node, nuList.$buffers[0]);
      };

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
      nuList.$viewValue.push(item);
    },
    '$update': function(index, item) {
      angular.element(children[index]).scope().item = item;
    }
  });

  this.$getItems = function(nodes) { return Array.prototype.slice.call(nodes, 0); };
  
  $scope.$watchCollection(model, function(modelValue) {
    nuList.$modelValue = modelValue;
    if( !equals(modelValue, nuList.$viewValue) ) {
      // TODO: need to find an alternative for this
      nuList.$viewValue = copy(modelValue);
      itemNodes = nuList.$getItems(children);
      nuList.$render();
      angular.element(itemNodes.splice(capacity)).remove();
      angular.element(itemNodes).css('display', 'none');
    }
  });

  this.$itemCompiler = $compile('<span ng-click="$erase(item)">{{item}}</span>');

  this.$itemNodeFactory = function(scopeExtend) {
    // There is an memory leek here because of $compile clone function
    var itemNode = angular.element(itemNodes.shift() || nuList.$itemCompiler(
      nuList.$defaults.$new(),
      function(itemNode) {
        appendItem(itemNode.addClass('list item')[0]);
      })
    );
    extend(itemNode.scope(), scopeExtend);
    return itemNode.css('display', '');
  };

  this.$removeItem = function(item) {
    var index = this.$viewValue.indexOf(item);
    if(children.length > index) {
      this.$viewValue.splice(index, 1);
      angular.element(children[index]).css('display', 'none');
      appendItem(children[index]);
    }
    $scope[model].splice(index, 1);
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
nu.service('listBuffers', function() {
  'use strict';
  var NuListBufferTypes = {};

  NuListBufferTypes.txt = function TextListBufferType(bufferNode, $scope) {
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
    }).addClass('buffer').html('');
  };

  NuListBufferTypes.default = noop;

  this.compile = function NuListBufferCompiler(templateStr, $scope) {
    //INFO: Replace the tag name buffer with span
    var bufferNode = angular.element(templateStr.replace(/(<\/?)buffer/gi, '$1span')),
        bufferType = bufferNode.attr('type') || 'default';
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
nu.directive('nuList', ['$compile', 'listBuffers',
  function($compile, listBuffers) {
    'use strict';
    return {
      terminal: true,
      priority: 500,
      template: '<div class="nu list"></div>',
      replace: true,
      transclude: 'element',
      restrict: 'EACM',
      controller: NuListController,
      link: function(scope, element, attrs, nuList, transcludeFn) {
        var template = transcludeFn();
        template.scope().$destroy();
        var buffers = template.find('buffer').remove(),
            itemTemplate = trim(template.html());
        if(itemTemplate) {
            if( !startsWith(itemTemplate, '<') ) {
              itemTemplate = '<span ng-click="$erase(item)">' + itemTemplate + '</span>';
            }

            nuList.$itemCompiler = $compile(itemTemplate);
        }

        //INFO: Append Buffers, if Any
        if(buffers.length > 0){
          if( buffers.find('buffer').length > 0 ) {
            throw nuError('list', 'Nested buffers are not allowed');
          }

          angular.forEach(buffers, function(bufferTemplate) {
            var bufferScope = nuList.$bufferDefaults.$new(),
                bufferNode = $compile( listBuffers.compile(
                  trim(bufferTemplate.outerHTML), bufferScope ) )(bufferScope);
            
            nuList.$buffers.push(bufferNode[0]);
          });

          element.append(nuList.$buffers);

          nuList.$getItems = function(nodes) {
            return Array.prototype.slice.call(nodes, 0, -buffers.length);
          };
        }

        var eraseNode = function() { nuList.$removeItem(this.item); };

        attrs.$observe('readonly', function(value){
          nuList.$defaults.$erase = (value === 'false')? noop : eraseNode;
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
