/*global angular: true*/
var chainIt = function() {
  'use strict';
  var seq = arguments;
  return function() {
    for(var i = 0; i < seq.length; i++) {
      seq[i].apply(null, arguments);
    }
  };
};
var gallery = angular.module('nu.gallery', []); // gallery
gallery.directive('nuGallery', [
  function() {
    'use strict';
    return {
      template: '<div class="nu gallery"><a class="arrow right"></a><a class="arrow left"></a></div>',
      restrict: 'EACM',
      replace: true,
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        var rawElement = element[0];
        ngModel.baseIndex = ngModel.baseIndex || 2;
        
        var setActive = function() {
          angular.forEach(arguments, function(carret) {
            angular.element(rawElement.children[carret]).toggleClass('active');
          });
          return arguments[arguments.length - 1];
        };

        var arrowActions = [
          function() { // Next
            ngModel.index = setActive(ngModel.index,
              ( ngModel.index < (rawElement.children.length - 1) ?
                (ngModel.index + 1) : ngModel.baseIndex) );
          },
          function() { // Prev
            ngModel.index =setActive(ngModel.index,
              ( ngModel.index > ngModel.baseIndex ?
                (ngModel.index - 1) : (rawElement.children.length - 1) ) );
          }
        ];

        angular.forEach(element.find('a'), function(arrow, count) {
          angular.element(arrow).on('click', arrowActions[count]);
        });

        ngModel.$render = chainIt(ngModel.$render, function() {
          ngModel.index = 2;
          angular.forEach(ngModel.$viewValue, function(item) {
            element.append(angular.element('<img/>').attr('src', item.src || item));
          });
          angular.element(element.find('img')[0]).addClass('active');
        });
      }
    };
  }
]);

gallery.directive('nuGallerySlideBar', [
  function() {
    'use strict';
    return {
      restrict: 'A',
      replace: true,
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$render = chainIt(ngModel.$render, function() {
          //ngModel.$viewValue
        });
      }
    };
  }
]);
