/*global angular: true*/
var nuMedia = angular.module('nu.Media', []);

nuMedia.service('nuMedia', [function() {
  'use strict';
  var NUMedia = function(type) {
    this.media =  angular.element('<' + type + '/>').css('display', 'none');
    var rawMedia = media[0];

    this.available = !!rawMedia.canPlayType;
    //rawMedia.networkState
  };

  // timespan = [start, end]
  NUMedia.prototype.play = function(src, timespan) {}
  NUMedia.prototype.pause = function() {}
  NUMedia.prototype.stop = function() {}
  NUMedia.prototype.seek = function(offset) {} // 

  var audio = new NUMedia('audio'),
      video = new NUMedia('video');
  return {'audio': audio, 'video': video};
}]);