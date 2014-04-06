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

var random  = {
  id : function(options)  {
    options = angular.extend({pool: '0123456789abcdefghiklmnopqrstuvwxyz', size: 8}, options);

    var randStr = '';
    for (var i = 0; i < options.size; i++) {
      randStr += options.pool[Math.floor(Math.random() * options.pool.length)];
    }
    return randStr;
  }
};

var attribute = {
  move : function(dst, src, names) {
    for (var count = 0; count < names.length; count++) {
      dst.attr(names[count], src.attr(names[count]));
      src.removeAttr(names[count]);
    }
    return dst;
  }
};

var invoke = function(method) {
  var args = Array.prototype.slice.call(arguments, 1);
  if(angular.isFunction(method)){
    var result = method.apply(this, args);
    if( isDefinedAndNotNull(result) ) {
      return result;
    }
  }
  return args.length == 1? args[0] : args;
};

var isDefinedAndNotNull = function(value) {
  return typeof value != 'undefined' && value !== null;
};

var noop = angular.noop,
    copy = angular.copy,
    equals = angular.equals,
    forEach = angular.forEach,
    isString = angular.isString,
    isElement = angular.isElement,
    extend = angular.extend,
    trim = function(str) {
      return isString(str)? str.replace(/^\s+|\s+$/g, '') : '';
    },
    partial = function(fn, args, scope) {
      return function() {
        return fn.apply(scope, args.concat(Array.prototype.slice.call(arguments, 0)));
      };
    };

var startsWith = function(str, subStr) {
  return isString(str) && isString(subStr) && str.indexOf(subStr) === 0;
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

/**
 *
 * @Events
 * * push
 * * pop - Invoked when `.pop` is call with the element that is about to be poped Out of the pool
 * * flush - Triggered with target as the `Item` which is not being 
 *     add to the Pool as it excedes the Pool size
 */
var EventPool = (function(extend, NuEventManager) {
  var _export = function(size) {
    NuEventManager.call(this);
    this.size = size || 10;
  };

  _export.prototype = [];
  extend(_export.prototype, NuEventManager.prototype);

  _export.prototype.push = function() {
    var items = Array.prototype.slice.call(arguments, 0),
        capacity = this.size - this.length,
        flush = items.splice(capacity);
    
    if(items) {
      var event = this.trigger('push', {target: items});
      if(event.target) { Array.prototype.push.apply(this, items); }
    }
    if(flush) { this.trigger('flush', {target: flush}); }
  };

  _export.prototype.pop = function() {
    var item = Array.prototype.pop.call(this);
    if(item) { this.trigger('pop', {target: item}); }
    return item;
  };

  _export.prototype.remove = function(item) {
    if(item) {
      var index = this.indexOf(indexOf);
      if(index !== -1) {
        item = Array.prototype.splice.call(this, index, 1)[0];
        this.trigger('pop', {target: item});
      }
    }
  };
  _export.prototype.shift = function() {
    var item = Array.prototype.shift.call(this);
    if(item) { this.trigger('pop', {target: item}); }
    return item;
  };

  return _export;
})(angular.extend, NuEventManager);