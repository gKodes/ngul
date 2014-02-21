// nu.js
//'use strict';
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
  }
};