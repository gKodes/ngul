// nu.js
'use strict';
/*global angular: true*/
var nu = {
  random : {
    id : function(options)  {
      options = angular.extend({pool: '0123456789abcdefghiklmnopqrstuvwxyz', size: 8}, options);

      var randStr = '';
      for (var i = 0; i < options.size; i++) {
        randStr += options.pool[Math.floor(Math.random() * options.pool.length)];
      }
      return randStr;
    }
  },
  attr: {
    move : function(dst, src, names) {
      for (var count = 0; count < names.length; count++) {
        dst.attr(names[count], src.attr(names[count]));
        src.removeAttr(names[count]);
      }
      return dst;
    }
  },
  'switch': function(isTrue, onTrue, onFalse) {
    if (onTrue && onFalse) {
      return isTrue ? onTrue : onFalse;
    }
    return isTrue;
  },
  invoke: function(method) {
    var args = Array.prototype.slice.call(arguments, 1);
    if(angular.isFunction(method)){
      var result = method.apply(this, args);
      if( nu.isDefinedAndNotNull(result) ) {
        return result;
      }
    }
    return args.length == 1? args[0] : args;
  },
  isDefinedAndNotNull: function(value) {
    return typeof value != 'undefined' && value !== null;
  },
  pipeLine: function(pipe, done) {
    var PipeLine = function(pipe, done) {
      var index = 0;
      var isAsync = false;
      var onAsync = angular.noop;
      var scope = {
        'async' : function() {
          isAsync = true;
          onAsync();
          return next;
        }
      };

      var next = this.next = function(item){
        while(index < pipe.length) {
          item = pipe[index++].call(scope, item);
          if( isAsync ) {
            this.isAsync = false;
            return this;
          }
        }
        done(item);
        return this;
      };

      this.isAsync = function() {
        return isAsync;
      };

      this.onAsync = function(value) {
        onAsync = value;
        return this;
      };
    }
    return new PipeLine(pipe, done);
  }
};