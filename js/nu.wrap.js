/*global angular, isFunction, noop, nodes, toBoolean, isUndefined, getngModelWatch, PRISTINE_CLASS, DIRTY_CLASS, forEach */

var nuWrap = angular.module('nu.Wrap', []);

var WRAP_EDITOR_CLASS = 'ws-view', //wrap state view
    WRAP_VIEW_CLASS = 'ws-edit'; //wrap state edit

nuWrap.run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('nu.wrap.default',
    '<div>' +
      '<wrap-view>{{$model$}}</wrap-view>' +
      '<wrap-in></wrap-in>' +
    '</div>');
}]);

var SimpleModelCtrl = function(input, wrapView) {
  'use strict';
  var ctrl = this;

  input.on('keydown', function(event) {
    var key = (event.which || event.keyCode);
    if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)){ return; }
    ctrl.$toAccept = true;
  });

  this.$accept = function() {
    ctrl.$viewValue = input.val();
    wrapView.html(ctrl.$viewValue || input.attr('placeholder'));
    ctrl.$toAccept = false;
  };

  this.$reset = function() {
    input.val(wrapView.html() !== input.attr('placeholder')?
        wrapView.html() : '');
    ctrl.$toAccept = false;
  };

  this.isSimple = true;
  this.$valid = true;
};

var nullWrapSetCtrl = {
  $template: 'nu.wrap.default'
};

var nullFormCtrl = {
  $setDirty: noop
};

nuWrap.directive('nuWrap', ['$templateCache', '$parse', '$compile', '$exceptionHandler', '$animate',
  function ($templateCache, $parse, $compile, $exceptionHandler, $animate) {
    'use strict';

    return {
      restrict: 'AC',
      require: ['?ngModel', '^?form', '^?wrapset'],
      priority: 10, // Just that it runs after ngModel
      link: function(scope, element, attrs, ctrls) {
        var rawElement = element[0],
            wrapView = angular.element('<a class="w-view show-view"></a>'),
            modelCtrl = ctrls[0] || new SimpleModelCtrl(element, wrapView, actionScope),
            formCtrl = ctrls[1] || nullFormCtrl,
            wrapset = ctrls[2] || nullWrapSetCtrl,
            actionScope = scope.$new(true);

        var wrap = angular.element(
            $templateCache.get(attrs.nuWrap || wrapset.$template) );
        
        if(wrap.length > 1) {
          wrap = angular.element('<div></div>').append(wrap);
        }
        
        wrap.addClass('nu wrap ws-view');

        // Bind the model so any change to it would reflect in the wrapView
        wrapView.html(
          (wrap.find('wrap-view').html() || '{{$model$}}' )
            .replace('$model$', '$viewValue'));

        if( !wrap.find('wrap-view').replaceWith(wrapView).length ) {
          wrap.prepend(wrapView);
        }

        var placeHolderNode = nodes.append.text(wrapView[0], '');

        $compile(wrap)(actionScope);

        element.addClass('show-editor w-edit');
        /* INFO: Why not use replaceWith? - because it daloc all 
         * the events & data which here we need to keep them
         */
        rawElement.parentNode.replaceChild(wrap[0], rawElement);
        wrap[0].replaceChild(rawElement, wrap.find('wrap-in')[0]);

        var validatePlaceHolder = function(canShow) {
          var holderText = element.attr('placeholder');
          placeHolderNode.nodeValue = holderText && canShow? holderText : '';
        };

        modelCtrl.$toAccept = false;

        if( isFunction(modelCtrl.$setViewValue) ) {
          var ngModelGet = $parse(attrs.ngModel),
              ngModelSet = ngModelGet.assign;

          actionScope.$valid = modelCtrl.$valid;
          actionScope.$error = modelCtrl.$error;
          actionScope.$viewValue = modelCtrl.$viewValue;
          actionScope.$modelValue = modelCtrl.$modelValue;

          var watch = getngModelWatch(scope, modelCtrl,
            ngModelGet(scope), ngModelSet),
              viewStateStore = false;

          if(watch) {
            watch.get = function nuWrapModelWatch(scope) {
              if( modelCtrl.$toAccept ) { return watch.last; }
              var value = watch.exp(scope);
              actionScope.$viewValue = modelCtrl.$viewValue;
              actionScope.$modelValue = modelCtrl.$modelValue;
              validatePlaceHolder(!modelCtrl.$viewValue ||
                modelCtrl.$viewValue === '');
              return value;
            };
          }

          modelCtrl.$setViewValue = function(value) {
            modelCtrl.$viewValue = value;
            modelCtrl.$toAccept = true;

            // change to dirty
            if (modelCtrl.$pristine) {
              modelCtrl.$dirty = true;
              modelCtrl.$pristine = false;
              $animate.removeClass(element, PRISTINE_CLASS);
              $animate.addClass(element, DIRTY_CLASS);
              formCtrl.$setDirty();
            }

            forEach(this.$parsers, function(fn) {
              value = fn(value);
            });
            
            actionScope.$viewValue = modelCtrl.$viewValue;
            modelCtrl.$modelValue = actionScope.$modelValue = value;
            actionScope.$valid = modelCtrl.$valid;
          };

          modelCtrl.$accept = function() {
            ngModelSet(scope, actionScope.$modelValue);
            forEach(modelCtrl.$viewChangeListeners, function(listener) {
              try {
                listener();
              } catch(e) {
                $exceptionHandler(e);
              }
            });
            modelCtrl.$toAccept = false;
            validatePlaceHolder(!modelCtrl.$viewValue ||
              modelCtrl.$viewValue === '');
          };

          modelCtrl.$reset = function() {
            modelCtrl.$toAccept = false;
            var value = watch.exp(scope);
            if( !value ) {
              modelCtrl.$viewValue = modelCtrl.$modelValue = value;
              element.val('');
            }
            actionScope.$viewValue = modelCtrl.$viewValue;
            actionScope.$modelValue = modelCtrl.$modelValue;
            actionScope.$valid = modelCtrl.$valid;
          };
        }

        validatePlaceHolder(!element.val());

        actionScope.reset = modelCtrl.$reset;
        actionScope.accept = modelCtrl.$accept;
        actionScope.show = function(viewState) {
          if(viewState !== viewStateStore) {
            if(!modelCtrl.$toAccept) {
              actionScope.resetValue = modelCtrl.$modelValue;
            }

            wrap
              .removeClass(viewState? WRAP_EDITOR_CLASS : WRAP_VIEW_CLASS)
              .addClass(viewState? WRAP_VIEW_CLASS : WRAP_EDITOR_CLASS);
            viewStateStore = viewState;
          }
        };

        var keyDownHandler = function(event) {
          try {
            var keyCode = (event.which || event.keyCode);
            if( (keyCode === 13 && !event.ctrlKey) || keyCode === 27 ) {
              if ( !modelCtrl.$valid || keyCode === 27 ) {
                modelCtrl.$reset();
              } else { modelCtrl.$accept(); }
              scope.$digest();
              actionScope.show(false);
            }
          } catch (e) { $exceptionHandler(e); }
        };

        element.on('keydown', function(event) {
          try {
            var keyCode = (event.which || event.keyCode);
            if( (keyCode === 13 && !event.ctrlKey) || keyCode === 27 ) {
              event.preventDefault();
            } else if ( !modelCtrl.$toAccept &&
              !( (15 < keyCode && keyCode < 19) || keyCode === 91 ) ) { 
              actionScope.show(true);
            }
          } catch (e) { $exceptionHandler(e); }
        });

        attrs.$observe('defaultNav', function(value) {
          // INFO: Changed event to Key for FF Issue && split the show into key up event
          element[(isUndefined(value) || toBoolean(value)? 'on' : 'off')]('keyup', keyDownHandler);
        });

        element.on('focus', function() {
          if( !modelCtrl.$toAccept ) { actionScope.show(true); }
        });

        wrapView.on('focus', function() {
          element.focus();
        });

        element.on('blur', function() {
          // Hide the edit if out of focus and value is not chaged
          if( !modelCtrl.$toAccept ) { actionScope.show(false); }
        });

        wrapView.on('mousedown', function() {
          actionScope.show(true);
          setTimeout(function() { rawElement.focus(); }, 0);
        });
      }
    };
  }
]);

nuWrap.filter('asterises', function() {
  'use strict';
  return function(input, asterisk) {
    if(input) {
      var output = '';
      for (var i = 0; i < input.length; i++) {
        output += asterisk || '\u2022';
      }
      return output;
    }
    return input;
  };
});

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