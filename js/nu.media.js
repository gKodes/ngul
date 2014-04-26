/*global angular, isFile, isString, forEach, isObject, lowercase, isUndefined, startsWith: true*/
var nuMedia = angular.module('nu.Media', []);

nuMedia.service('nuMedia', [function() {
  'use strict';
  function fetchType(uri) {
    //
  }

  var NUMedia = function(type) {
    var $el = this.$el = angular.element('<' + type + '/>');
    var el = this.el = $el[0];

    this.available = !!el.canPlayType;
    
    angular.element(document.body).append($el.css('display', 'none'));
    //rawMedia.networkState

    this.createASource = function(blob, ignoreType) {
      if( lowercase(blob.tagName) === 'source' ) {
        return blob;
      }
      
      var uri, type;
      if( isFile(blob) ) {
        if( !el.canPlayType(blob.type) ) { return; }
        uri = URL.createObjectURL(blob);
        type = blob.type;
      }
      if ( isObject(blob) && blob.src ) {
        if(!blob.type) { blob = blob.src; }
        uri = blob.src;
        type = blob.type;
      }
      if ( isString(blob) ) {
        uri = blob;
        if(!ignoreType) {
          type = fetchType(blob.src);
          if( !el.canPlayType(type) ) { return; }
        }
      }
      // If From Server need to get the type to check and see if it can be played
      if(uri && (type || ignoreType)) {
        return angular.element('<source/>')
              .attr('src', uri)
              .attr('type', type);
      }
    };
  };
  //NuEventManager

  // timespan = [start, end]
  // angular.extend(NUMedia.prototype, Array.prototype);
  NUMedia.prototype.play = function(src, timespan) {
    if( this.current === src || (isUndefined(src) && this.el.duration) ) {
      return this.el.play();
    }//angular.lowercase

    var source;
    if( isFile(src) ) {
      if(this.canPlay(src.type)) {
        source = this.createASource(src);
      }
    } else if ( isObject(src) ) {
      forEach(function(src) {
      });
    }

    if(source) {
      this.stop();
      this.$el.append(source);
      this.el.play();
      this.current = src;
    }

    //return {} // event state/time/inuse
  };
  
  NUMedia.prototype.pause = function() {
    if(this.el.duration) { this.el.pause(); }
  };
  
  NUMedia.prototype.stop = function() {
    this.pause();
    this.current = null;
    var src = this.$el.find('source').attr('src');
    if(startsWith(src, 'blob:')) { URL.revokeObjectURL(src); }
    //For FF need to set to empty string to create buffer.
    this.$el.attr('src', '').removeAttr('src').html('');
  };
  
  NUMedia.prototype.seek = function(offset) {};
  NUMedia.prototype.canPlay = function(blod) {
    return this.el.canPlayType(blod.type || blod);
  };

  var audio = new NUMedia('audio'),
      video = new NUMedia('video');
  return {'audio': audio, 'video': video, 'type': angular.noop};
}]);