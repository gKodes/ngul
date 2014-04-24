/*global angular: true*/
var nuSrc = angular.module('nu.Src', []);

nuSrc.directive('nuSrc', [
  function() {
    'use strict';

    return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
        scope.$watch(attrs.nuSrc, function(value) {
          if( isString(value) ) {
            attrs.$set('src', value);
          } else if (window.File && window.FileReader &&
                value.name && value.lastModifiedDate) { // value.isFile
            // element.attr('src', URL.createObjectURL(value));
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
