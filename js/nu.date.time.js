var nuDateTime = angular.module('nu.DateTime', []);

nuDateTime.service('DateFormater', [function() {
    //
  }
]);

DateFormater - toDate, fromDate

nuFileChooser.directive('nuDay', ['DateFormater',
  function(DateFormater) {
    return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
      }
    };
  }
]);

nuFileChooser.directive('nuTime', [
  function() {
    return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
      }
    };
  }
]);


nuFileChooser.directive('nuDateTime', ['DateFormater',
  function(DateFormater) {
    return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
      }
    };
  }
]);
