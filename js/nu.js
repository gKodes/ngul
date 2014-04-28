/*global angular */

var VALID_CLASS = 'ng-valid',
    INVALID_CLASS = 'ng-invalid',
    PRISTINE_CLASS = 'ng-pristine',
    DIRTY_CLASS = 'ng-dirty';

var RE_EXT = /(\..+)$/i;
var RE_BASENAME = /([^\\\/]+)$/;

var split_re = function(re) {
  'use strict';
  var dummy_result = ['',''];
  return function(str) {
    if(str) {
      var splits = str.split(re);
      return splits? splits.splice(0,2) : dummy_result;
    }
    return dummy_result;
  };
};

var move = {},
    random = {},
    nodes = {},
    path = {},
    noop = angular.noop,
    copy = angular.copy,
    equals = angular.equals,
    forEach = angular.forEach,
    isObject = angular.isObject,
    isString = angular.isString,
    isElement = angular.isElement,
    isFunction = angular.isFunction,
    isUndefined = angular.isUndefined,
    lowercase = angular.lowercase,
    extend = angular.extend,
    nuError = angular.$$minErr('nu');

function isDefinedAndNotNull(value) {
  'use strict';
  return typeof value !== 'undefined' && value !== null;
}

function trim(str) {
  'use strict';
  return isString(str)? str.replace(/^\s+|\s+$/g, '') : '';
}

function partial(fn, args, scope) {
  'use strict';
  return function() {
    return fn.apply(scope, args.concat(Array.prototype.slice.call(arguments, 0)));
  };
}

function startsWith(str, subStr) {
  'use strict';
  return isString(str) && isString(subStr) && str.indexOf(subStr) === 0;
}

/**
 * Split the pathname `path` into a pair (`root`, `ext`) such that `root + ext == path`.
 * If `ext` is empty will return the basename it self, an `ext` begins with a period followed by any char's. 
 * Leading periods on the basename are ignored; splitext('.cshrc') returns ('', '.cshrc').
 */
path.splitext = function(input_path) {
  var basepath = path.basename(input_path),
      exta = RE_EXT.exec(basepath),
      result = [basepath, ((exta && exta.length === 2)? exta[1] : '')];
  result[0] = result[0].substr(0, result[0].length - exta.length);
  return result;
}

/**
 * Return the base name of pathname path. Where basename for '/foo/bar' returns 'bar' and for '/foo/bar/' return an empty string ''.
 */
path.basename = function(input_path) {
  var basea = RE_BASENAME.exec(input_path);
  return basea? basea[1]: input_path;
}

function toBoolean(rawValue) {
  'use strict';
  if( rawValue && isString(rawValue) ) {
    var value = rawValue.toLowerCase();
    return !(value === 'false' || value === 'f' || value === 'off');
  }
  return rawValue === true;
}

function isFile(blob) {
  'use strict';
  return blob && blob.lastModifiedDate && isString(blob.type);
}

random.defaults = { pool: '0123456789abcdefghiklmnopqrstuvwxyz', size: 8 };
random.id = function(options) {
  'use strict';
  options = extend(random.defaults, options);

  var randStr = '';
  for (var i = 0; i < options.size; i++) {
    randStr += options.pool[Math.floor(Math.random() * options.pool.length)];
  }
  return randStr;
};

move.attribute = function(dst, src, names) {
'use strict';
  for (var count = 0; count < names.length; count++) {
    dst.attr(names[count], src.attr(names[count]));
    src.removeAttr(names[count]);
  }
  return dst;
};

nodes.move = move;
nodes.append = {};
nodes.append.text = function(parent, text, beforeNode) {
  'use strict';
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
  'use strict';
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
    'use strict';
    forEach(this.$parsers, function(fn) {
      value = fn(value);
    });
    this.$modelValue = value;
  },
  isNull: true
};
function initTwoStateSwtich(scope, element, attrs, ngModel, Event, defaultValue) {
  'use strict';
  var id = attrs.id,
      input = element.find('input'),
      label = element.find('label'),
      trueValue = attrs.ngTrueValue,
      falseValue = attrs.ngFalseValue;

  ngModel = ngModel || nullInputngModle;

  //Generate an unique id if not present
  if (id) {
    element.removeAttr('id');
  } else { id = random.id(); }

  //move some common attributes over
  move.attribute(input, element, ['type', 'name', 'checked']).attr('id', id);
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

/* global
   -isFile
   -isString
   -copy
   -extend
   -VALID_CLASS
   -INVALID_CLASS
   -PRISTINE_CLASS
   -DIRTY_CLASS
   -splitext
   -noop
*/
