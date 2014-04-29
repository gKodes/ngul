/*global angular,forEach : true*/
var nuFilter = angular.module('nu.Filter', []);

var nuFilterController = ['$scope', '$element', '$attrs', '$filter', '$parse',
    function($scope, $element, $attrs, $filter, $parse) {
  'use strict';
  var nuFilter = this,
      filterExp = $attrs.nuFilter;
  this.chain = [];

  function nuFilterChainWithArgs(scope, filterFn, argsTokens) {
    return function nuFilterChainArged(value) {
      var args = [],
          idx = argsTokens.length;
      while(idx--) { args.unshift($parse(argsTokens[i])(scope)); }
      args.unshift(value);
      return filterFn.apply(null, args);
    };
  }

  function nuFilterChainNoArgs(filterFn) {
    return function nuFilterChain(value) {
      return filterFn(value);
    };
  }

  if(filterExp) {
    var lastIndex = 0;
    for(var i = 0; i < filterExp.length; i++) {
      var index = filterExp.indexOf('|', i);
      if( index !== -1 ) {
        if(filterExp[index + 1] !== '|') { continue; }
      } else { index = filterExp.length; }

      var filterTokens = filterExp.substr(lastIndex, index).split(':'),
          filterFn = $filter(filterTokens[0]);
      
      if( filterFn ) {
        nuFilter.chain.push(filterTokens.length === 1?
          nuFilterChainNoArgs(filterFn): nuFilterChainWithArgs($scope,
            filterFn, filterTokens.slice(1))
        );
      }

      lastIndex = index;
    }
  }
}];

nuFilter.directive('nuFilter', [
  function() {
    'use strict';
    return {
      //require: 'nuFilter',
      priority: -10,
      restrict: 'AC',
      require: ['ngFilter', '?ngModel', '?nuList'],
      controller: nuFilterController,
      link: function(scope, element, attrs, ctrls) {
        var ngFilterCtrl = ctrls[0];
        forEach(ctrls, function(ctrl) {
          if(ctrl && ctrl.$formatters) {
            ctrl.$formatters = ctrl.$formatters.concat(ngFilterCtrl.chain);
          }
        });
      }
    };
  }
]);