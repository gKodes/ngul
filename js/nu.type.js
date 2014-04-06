/*global nu, noop, equals, forEach: true*/
/*
<nu-type src="mode">
  {{item}}
</nu-type>

<nu-type src="mode">
  <img src="{{item.src || item}}"></img>
</nu-type>
*/
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
      controller: ['$scope', '$element', '$exceptionHandler', '$attrs', function($scope, $element, $exceptionHandler, $attrs) {
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
      }],
      link: function(scope, element, attr, nuList, transcludeFn) {
        transcludeFn(function(template, scope) {
          //template.find('buffer').remove();
          scope.$destroy();
          var nodeTmpl = trim(template[0].innerHTML);
          if(nodeTmpl.length > 0){
            if( nodeTmpl.indexOf('<') !== 0 ) { 
              nodeTmpl = "<span>" + nodeTmpl + "</span>";
            }

            nuList.$itemFactory = $compile(angular.element(nodeTmpl)
              .addClass("list item"));
          }
        });

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
