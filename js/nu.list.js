/*global angular, nu, noop, equals, copy, trim, EventPool, startsWith, forEach, extend: true*/
/**
 * @ngdoc object
 * @name ng.directive:nuList.NuListController
 *
 * @property {Object|Array} $viewValue Actual string value in the view.
 * @property {Object|Array} $modelValue The value in the model, that the control is bound to.
 * @property {Function} $itemCompiler `$compile`
 * @property {Function} $itemFactory fn, creator
 * @property {Function} $appendItem
 * @property {Function} $removeItem
 * @property {Function} $render
 * @property {number} $buffers - ??
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

  var sliceItemNodes = partial(Array.prototype.slice, [0], children);
  
  $scope.$watchCollection(model, function(modelValue) {
    nuList.$modelValue = modelValue;
    if( !equals(modelValue, nuList.$viewValue) ) {
      // TODO: need to find an alternative for this
      nuList.$viewValue = copy(modelValue);
      itemNodes = sliceItemNodes(nuList.$buffers? (-nuList.$buffers.length) : undefined);
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
 * @ngdoc directive
 * @name nu:nuList
 *
 * @restrict EACM
 * @element ANY
 * @priority 500
 * @param {string} nuList Assignable angular expression to data-bind to.
 * @param {string} src Assignable angular expression to data-bind to this is used in case `nuList` is not present.
 * @param {number} capacity Optional the number of `itemNode`'s to be Pooled for re-use. Default value is 10
 * @param {number} min
 * @param {number} max
 *
 * @description
 *
 * The `nuList` directive instantiates a template once per item from a collection. Each template
 * instance gets its own scope, where the given loop variable is set to the current collection item,
 * `$index` is set to the item index or key, and `$erase` is a function on invocation would remove the
 * item from the collection and update the view respectively.
 *
 <doc:example>
   <doc:source>
    I can add: 1 + 2 =  {{ 1+2 }}
   </doc:source>
 </doc:example>
 *
 */
nu.directive('nuList', ['$compile',
  function($compile) {
    'use strict';
    var template = '<div class="nu list"></div>';
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
          angular.forEach(buffers, function(bufferTemplate) {
            nuList.$buffers.push(
              $compile(bufferTemplate)(nuList.$bufferDefaults.$new())[0] );
          });
          element.append(nuList.$buffers);
        }

        nuList.$render = function() {
          /*{
            'item' : nuList.$viewValue[index],
            '$index': index,
            '$first':
            '$middle':
            '$last':
            '$even':
            '$odd':
          }*/

          forEach(nuList.$viewValue, function(item, index) {
            nuList.$itemNodeFactory({'item' : item, '$index': index});
          });
        };

        if(attrs.by){}
      }
    };
  }
]);
