/*global nu, noop, equals, isUndefined: true*/
nu.directive('nuModel', [
  function() {
    'use strict';
    return {
      priority: 600,
      restrict: 'EA',
      controller: ['$scope', '$exceptionHandler', '$attr', '$parse', function($scope, $exceptionHandler, $attr, $parse) {
        this.$viewValue = Number.NaN;
        this.$modelValue = Number.NaN;
        this.$parsers = [];
        this.$formatters = [];
        this.$viewChangeListeners = [];
        /*// Not Supported
        this.$pristine = true;
        this.$dirty = false;
        this.$valid = true;
        this.$invalid = false;*/
        this.$name = $attr.name;

        var base = $attr.nuModel? 'nuModel' : 'src';
        var nuModel = this;
        var modelGet = $parse($attr[base]),
            modelSet = modelGet.assign; // if not presnet then its attribute watch
        var updateView = function(value) {
          if ( !nuModel.$isEmpty(value) && !equals(nuModel.$modelValue, value) ) {
            value = nuModel.$format(value);
            if ( !nuModel.$isEmpty(value) && !equals(nuModel.$viewValue, value) ) {
              try {
                nuModel.$viewValue = value;
                nuModel.$render();
              } catch(e) { $exceptionHandler(e); }
            }
          }
        };

        this.$render = noop;

        this.$isEmpty = function(value) {
          return isUndefined(value) || value === '' || value === null || value !== value;
        };

        this.$parser = function(value) {
          try {
            for(var idx = 0; idx < this.$parsers.length; idx++) {
              value = this.$parsers[idx](value);
            }
          } catch(e) { $exceptionHandler(e); }
          return value;
        };

        this.$format = function(value) {
          try {
            for(var idx = (this.$formatters.length - 1); this.$formatters[idx]; idx--) {
              value = this.$formatters[idx](value);
            }
          } catch(e) { $exceptionHandler(e); }
          return value;
        };

        this.$setViewValue = noop;

        if(modelSet) {
          this.$setViewValue = function(value) {
            if ( !equals(this.$modelValue, value) ) {
              modelSet(this.$parser(value));
            }
          };

          $scope.$watch(function nuModelWatch() {
            updateView(modelGet($scope));
          });
        } else {
          this.$readOnly = true;
          $attr.$observe(base, function(value) {
            updateView($parse(value)($scope));
          });
        }
      }]
    };
  }
]);

nu.directive('contenteditable', [
  function() {
    return {
      priority: 100,
      restrict: 'A',
      require: '?nuModel',
      link: function(scope, element, attr, nuModel) {
        //
      }
    };
  }
]);