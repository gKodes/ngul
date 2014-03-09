/*global angular: true*/
var slider = angular.module('nu.slider', []); // gallery
slider.service('_ScrollSize', ['$window', function($window) {
  'use strict';
  var height, width, sliders = [],
  scrollNode = angular.element(
    '<div style="width:100px;height:100px;overflow:scroll;">' +
      '<div style="width:200px;height:200px;"></div>' +
    '</div>');
  
  var calcDimension = function(rawElement, rawFrame) {
    if(rawFrame.offsetWidth >= rawElement.clientWidth) {
      element.css({'maxHeight': rawFrame.clientHeight + 'px'});
    }

    sliders.push([rawElement, rawFrame]);

    frame.css({
      'height': (100 + ((height / rawElement.clientHeight)* 100)) + '%',
      'width': (100 + ((width / rawElement.clientWidth) * 100)) + '%'
    });
  };

  angular.element($window).on('resize', function() {
    angular.forEach(sliders, function(slider) {
      calcDimension.apply(null, slider);
    });
  });

  this.estimate = function() {
    angular.element($window.document.body).append(scrollNode);
    height = (scrollNode[0].offsetHeight - scrollNode[0].clientHeight);
    width = (scrollNode[0].offsetWidth - scrollNode[0].clientWidth);
    scrollNode.remove();
  };

  this.height = function() { return height; };
  this.width = function() { return width; };
  this.hideBars = function(element, frame) {
    calcDimension(element[0], frame[0]);
  };

  this.estimate();
}]);

slider.directive('nuSlider', ['_ScrollSize', // Gallery
  function(scrollSize) {
    'use strict';
    var template =
      '<div class="nu slider">' +
        '<div class="frame" style="overflow:scroll;"></div>'+
      '</div>';

    return {
      replace: true,
      template: template,
      restrict: 'EACM',
      transclude: true,
      link: function(scope, element, attrs, ngController, transclude) {
        var frame = element.css('overflow','hidden').find('div');

        transclude(scope, function(clone) {
          frame.append(clone);
          scrollSize.hideBars(element, frame);
        });
      }
    };
  }
]);