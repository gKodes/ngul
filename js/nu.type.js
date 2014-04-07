/*global nu, noop, equals, forEach: true*/
/*
<nu-type src="">
  <datasets> <!-- data set is an optional tag -->
    <header>{{title}}</header> <!-- header that to be shown for the data set group -->
    {{item}} <!-- item template -->
  </datasets>
</nu-type>
*/
var NuTypeController = ['$scope', '$element', '$exceptionHandler', '$attrs', 
    function($scope, $element, $exceptionHandler, $attrs) {
  this.$viewValue = Number.NaN;
  this.$modelValue = Number.NaN;
  this.$render = noop;
  this.$name = $attrs.name;
  this.$defaults = {
    item: undefined,
    index: undefined,
    erase: function() {
      console.info(this.item);
    }
  };

  var nuList = this;
  
  var model = $attrs.nuList || $attrs.src;
  $scope.$watchCollection(model, function(modelValue) {
    nuList.$modelValue = modelValue;
    if( !equals(modelValue, nuList.$viewValue) ) {
      nuList.$viewValue = modelValue;
      nuList.$render();
    }
  });

  this.$itemFactory = $compile(angular.element('<span>{{item}}</span>')
      .addClass("list item"));

  this.$appendItem = function(itemNode) {
    if( angular.isElement(itemNode) ) {
      $element.append(itemNode);
    }
    // TODO: Node Pooling
  };
}];

nu.directive('nuType', ['$compile',
  function($compile) {
    'use strict';
    return {
      priority: 500,
      template: '<span class="nu type"><input><input></span>',
      restrict: 'EACM',
      terminal: true,
      replace: true,
      transclude: 'element',
      controller: NuTypeController,
      link: function(scope, element, attr, nuList, transcludeFn) {
        var template = transcludeFn();
        template.scope().$destroy();
        // buffers = template.find('buffer').remove();

        nuList.$render = function() {
          forEach(this.$viewValue, function(item, index) {
            nuList.$defaults.item = item; nuList.$defaults.index = index;
            nuList.$itemFactory(angular.extend(
              scope.$new(), nuList.$defaults), nuList.$appendItem);
          });
        };
      }
    };
  }
]);
