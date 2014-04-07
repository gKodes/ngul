/*global angular: true*/

var nu = angular.module('nu', []);

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
    noop = angular.noop,
    copy = angular.copy,
    equals = angular.equals,
    forEach = angular.forEach,
    isString = angular.isString,
    isElement = angular.isElement,
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
