/*global angular: true*/
var nuShow = angular.module('nu.Show', []);

nuShow.directive('nuShow', [
  function() {
    'use strict';
    var setActive = function() {
      angular.element(arguments).toggleClass('active');
      return arguments[arguments.length - 1];
    };

    return {
      template: '<div class="nu show">' +
        '<a class="navigation right"><div class="arrow right"></div></a>' +
        '<a class="navigation left"><div class="arrow left"></div></a></div>',
      restrict: 'EACM',
      replace: true,
      require: '?ngModel',
      transclude: true,
      link: function(scope, element, attrs, ngModel, transcludeFn) {
        var imgs, active, transcludes = [], rawElement = element[0];

        if(ngModel) {
          scope.$watchCollection(attrs.ngModel, function(viewValue) {
            if(angular.isArray(viewValue) && viewValue.length > 0) {
              angular.forEach(viewValue, function(item, index) {
                if ( !imgs[index] ) { imgs[index] = angular.element('<img/>')[0]; }
                if ( imgs[index] && imgs[index].parentNode !== rawElement ) { element.append(imgs[index]); }

                angular.element(imgs[index]).attr('src', item.src || item);
              });
              for(var i = viewValue.length; i < imgs.length; i++) {
                angular.element(imgs[i]).remove();
              }

              imgs = element.find('img');
              if(!active || active.parentNode !== rawElement) {
                active = setActive(imgs[0]);
              }
            } else { angular.element(imgs).remove(); }
          });
        }

        transcludeFn(function(nodes) {
          angular.forEach(nodes, function(node) {
            if(node.tagName && node.tagName.toLowerCase() === 'img') {
              transcludes.push(node);
            }
          });
        });
        element.append(transcludes);
        imgs = element.find('img');
        if(imgs && imgs.length > 0) {
          active = setActive(imgs[0]);
        }

        var arrowActions = [
          function() { /*Next*/ active = setActive(active, active.nextSibling || imgs[0]); },
          function() { /*Prev*/ active = setActive(active,
            (active.previousSibling.tagName.toLowerCase() === 'img')? active.previousSibling : imgs[imgs.length - 1]); }
        ];

        angular.forEach(element.find('a'), function(arrow, count) {
          angular.element(arrow).on('click', arrowActions[count]);
        });
      }
    };
  }
]);