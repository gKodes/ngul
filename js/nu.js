/*global angular: true*/

var VALID_CLASS = 'ng-valid',
    INVALID_CLASS = 'ng-invalid',
    PRISTINE_CLASS = 'ng-pristine',
    DIRTY_CLASS = 'ng-dirty';

var RE_EXT = /\.([\w\d]+)$/i;
var RE_BASENAME = /([^\\\/]+)$/;

var split_re = function(re) {
  var dummy_result = ['',''];
  return function(str) {
    if(str) {
      var splits = str.split(re);
      return splits? splits.splice(0,2) : dummy_result;
    }
    return dummy_result;
  };
};

var splitext = split_re(RE_EXT);
var split = split_re(RE_BASENAME);
var basename = function(path) { return split(path)[1]; };
var move = {},
    random = {},
    nodes = {},
    noop = angular.noop,
    copy = angular.copy,
    equals = angular.equals,
    forEach = angular.forEach,
    isString = angular.isString,
    isElement = angular.isElement,
    isFunction = angular.isFunction,
    isUndefined = angular.isUndefined,
    extend = angular.extend,
    nuError = angular.$$minErr('nu'),
    isDefinedAndNotNull = function(value) {
      return typeof value != 'undefined' && value !== null;
    },
    trim = function(str) {
      return isString(str)? str.replace(/^\s+|\s+$/g, '') : '';
    },
    partial = function(fn, args, scope) {
      return function() {
        return fn.apply(scope, args.concat(Array.prototype.slice.call(arguments, 0)));
      };
    },
    startsWith = function(str, subStr) {
      return isString(str) && isString(subStr) && str.indexOf(subStr) === 0;
    },
    toBoolean = function(rawValue) {
      if( rawValue && isString(rawValue) ) {
        var value = rawValue.toLowerCase();
        return !(value === 'false' || value === 'f' || value === 'off');
      }
      return rawValu === true;
    };

random.defaults = { pool: '0123456789abcdefghiklmnopqrstuvwxyz', size: 8 };
random.id = function(options) {
    options = extend(random.defaults, options);

    var randStr = '';
    for (var i = 0; i < options.size; i++) {
      randStr += options.pool[Math.floor(Math.random() * options.pool.length)];
    }
    return randStr;
};

move.attribute = function(dst, src, names) {
  for (var count = 0; count < names.length; count++) {
    dst.attr(names[count], src.attr(names[count]));
    src.removeAttr(names[count]);
  }
  return dst;
};

nodes.move = move;
nodes.append = {};
nodes.append.text = function(parent, text, beforeNode) {
  var textNode = document.createTextNode(text);
  parent.insertBefore(textNode, beforeNode);
  return textNode;
};

var getngModelWatch = function(scope, ngModel, modelValue, ngModelSet) {
  'use strict';
  var length = scope.$$watchers.length,
      $render = ngModel.$render,
      uid = random.id(), isMatch = false;
  ngModelSet(scope, uid);
  ngModel.$render = function() { isMatch = true; };
  while(length--) {
    if( scope.$$watchers[length].get === scope.$$watchers[length].exp ) {
      scope.$$watchers[length].get();
      if( isMatch ) {
        break;
      }
    }
  }
  ngModel.$render = $render;
  ngModelSet(scope, modelValue);
  return scope.$$watchers[length];
};

var NuEventManager = (function() {
  var _export = function() {
    this.events = {};
  };

  _export.prototype.on = function(eventType, handler) {
    if( !this.events[eventType] ) { this.events[eventType] = []; }
    this.events[eventType].push(handler);
  };
  _export.prototype.off = function(eventType, handler) {
    if( this.events[eventType] ) { 
      var index = this.events[eventType].indexOf;
      if ( index !== -1 ) {
        return this.events[eventType].split(index, 1)[0];
      }
    }
  };
  _export.prototype.trigger = function(eventType, extraParameters) {
    if(this.events[eventType]) {
      forEach(this.events[eventType], function(fn) {
        fn(extraParameters);
      });
    }
    return extraParameters;
  };

  return _export;
})(forEach);

/* Switch & PB Common */
var nullInputngModle = {
  $isEmpty: angular.identity,
  $formatters: [],
  $parsers: [],
  $setViewValue: function(value) {
    forEach(this.$parsers, function(fn) {
      value = fn(value);
    });
    this.$modelValue = value;
  },
  isNull: true
};
function initTwoStateSwtich(scope, element, attrs, ngModel, Event, defaultValue) {
  var id = attrs.id;
      input = element.find('input'),
      label = element.find('label'),
      trueValue = attrs.ngTrueValue,
      falseValue = attrs.ngFalseValue;

  ngModel = ngModel || nullInputngModle;

  //Generate an unique id if not present
  if (id) {
    element.removeAttr('id');
  } else { input.attr('id', id); }

  //move some common attributes over
  move.attribute(input, element, ['type', 'name', 'checked']);
  label.attr('for', id);

  if( !ngModel.$isEmpty( isString(trueValue)? trueValue : true) || ngModel.isNull ) {
    //There are no default formaters for ngTrueValue/ngFalseValue
    ngModel.$isEmpty = function(value) {
      return value !== trueValue;
    };

    ngModel.$formatters.push(function(value) {
      if( trueValue ) { 
        return value === trueValue;
      }
      return value;
    });

    ngModel.$parsers.push(function(value) {
      if( trueValue ) { 
        return value ? trueValue : falseValue;
      }
      return value;
    });
  }

  element.off('click');
  input.off('click');

  ngModel.$render = function() {
    input[0].checked = ngModel.$viewValue;
  };

  if( input[0].defaultChecked && input[0].checked ) {
    ngModel.$setViewValue(true);
  }

  if( !ngModel.isNull && angular.isDefined(defaultValue) ) {
    var value;
    if( isString(defaultValue) ) {
      if(defaultValue === trueValue) { value = true; }
        if(defaultValue === falseValue) { value = false; }
    } else { value = defaultValue; }
    
    if(value) {
      ngModel.$setViewValue(value);
      ngModel.$render();
    }
  }

  input.on('change', function pbChange(event) {
    var isChecked = this.checked;
    event.stopPropagation();
    if( (this.type !== 'radio' || isChecked) ) {
      ngModel.$setViewValue(isChecked);
      if( !ngModel.isNull ) { scope.$digest(); }
    }

    Event.trigger('change', {'target': attrs.name, 'value': ngModel.$modelValue });
  });

  attrs.$observe('disabled', function(value) {
    if( angular.isDefined(value) && value !== 'false' ) {
      input.attr('disabled', value);
    } else { input.removeAttr('disabled'); }
  });
}
/* Switch & PB Common */