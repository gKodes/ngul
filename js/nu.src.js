/*global nu: true*/
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
