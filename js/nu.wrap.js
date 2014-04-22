/*global angular, isFunction, toBoolean, isUndefined */

var nuWrap = angular.module('nu.Wrap', []);

var WRAP_EDITOR_CLASS = 'ws-view', //wrap state view
    WRAP_VIEW_CLASS = 'ws-edit'; //wrap state edit

nuWrap.run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('nu.wrap.default',
    '<span class="nu wrap">' +
      '<wrap-view></wrap-view>' +
      '<wrap-in></wrap-in>' +
    '</span>');
}]);

var SimpleModelCtrl = function(input, wrapView) {
  'use strict';
  wrapView.html(input.val() || input.attr('placeholder'));
  input.on('keyup', function() {
    wrapView.html(input.val());
  });

  this.$reset = function() {
    input.val(wrapView.html());
  };
  this.isSimple = true;
};

var nullWrapSetCtrl = {
  $template: 'nu.wrap.default'
};

nuWrap.directive('nuWrap', ['$templateCache', '$parse', '$compile',
  function ($templateCache, $parse, $compile) {
    'use strict';
    return {
      restrict: 'AC',
      require: ['?ngModel', '^?wrapset'],
      priority: 10, // Just that it runs after ngModel linker
      link: function(scope, element, attrs, ctrls) {
        var rawElement = element[0],
            wrapset = ctrls[1] || nullWrapSetCtrl,
            wrapView = angular.element('<a class="w-view show-view">{{' + attrs.ngModel + '}}</a>'),
            ngModelGet = $parse(attrs.ngModel),
            ngModelSet = ngModelGet.assign,
            actionScope = scope.$new(true),
            modelCtrl = ctrls[0] || new SimpleModelCtrl(element, wrapView);

        var wrap = $compile(
          $templateCache.get(attrs.tmpl || wrapset.$template) )
          (actionScope).addClass('ws-view');

        actionScope.resetValue = ngModelGet(scope);

        element.addClass('show-editor w-edit');
        /* INFO: Why not use replaceWith? - because it daloc all 
         * the events & data which here we need to keep them
         */
        rawElement.parentNode.replaceChild(wrap[0], rawElement);
        wrap.find('wrap-in').replaceWith(element);
        wrap.find('wrap-view').replaceWith(wrapView);
        
        if( isFunction(modelCtrl.$setViewValue) ) {
          // Bind the model so any change to it would reflect in the wrapView
          $compile(wrapView)(scope);
          actionScope.error = modelCtrl.$error;
          actionScope.value = actionScope.validValue = ngModelGet(scope);
          var ngSetViewValue = modelCtrl.$setViewValue,
              ngRender = modelCtrl.$render;

          modelCtrl.$render = function() {
            actionScope.show(false);
            ngRender.call(modelCtrl);
          };

          modelCtrl.$setViewValue = function(value) {
            actionScope.value = value;
            ngSetViewValue.call(modelCtrl, value);
            actionScope.valid = modelCtrl.$valid;
            actionScope.validValue = modelCtrl.$modelValue;
          };

          modelCtrl.$reset = function() {
            ngModelSet(scope, actionScope.resetValue);
          };
        }

        actionScope.reset = modelCtrl.$reset;
        actionScope.show = function(showEdit) {
          wrap
            .removeClass(showEdit? WRAP_EDITOR_CLASS : WRAP_VIEW_CLASS)
            .addClass(showEdit? WRAP_VIEW_CLASS : WRAP_EDITOR_CLASS);
        };

        var keyDownHandler = function(event) {
          var keyCode = (event.which || event.keyCode);
          if( keyCode === 13 || keyCode === 27 ) {
            if ( (keyCode === 13 && !modelCtrl.$valid) || keyCode === 27 ) {
              modelCtrl.$reset();
            }
            actionScope.show(false);
            scope.$digest();
            setTimeout(function() { rawElement.blur(); }, 0);
          }
        };

        attrs.$observe('defaultNav', function(value) {
          element[(isUndefined(value) || toBoolean(value)? 'on' : 'off')]('keydown', keyDownHandler);
        });

        wrapView.on('mousedown', function() {
          actionScope.resetValue = ngModelGet(scope) || actionScope.resetValue;
          actionScope.show(true);
          setTimeout(function() { rawElement.focus(); }, 0);
        });
      }
    };
  }
]);

nuWrap.directive('wrapset', [
  function() {
    'use strict';
    return {
      restrict: 'EAC',
      controller: ['$scope', '$element', '$attrs',
        function($scope, $element, $attrs) {
          this.$template = $attrs.wrapset || $attrs.tmpl;
      }]
    };
  }
]);