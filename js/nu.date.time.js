/*global angular: true*/
var nuDateTime = angular.module('nu.DateTime', []);

nuDateTime.service('DateFormater', [function() {
    'use strict';
    //
  }
]);

// DateFormater - toDate, fromDate

nuDateTime.directive('nuDay', ['DateFormater',
  function(DateFormater) {
    'use strict';
    return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
      }
    };
  }
]);

nuDateTime.directive('nuTime', [
  function() {
    'use strict';
    return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
      }
    };
  }
]);


nuDateTime.directive('nuDateTime', ['DateFormater',
  function(DateFormater) {
    'use strict';
    return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
      }
    };
  }
]);
