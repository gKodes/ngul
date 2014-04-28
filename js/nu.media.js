/*global angular, isFile, isString, isObject, lowercase, isUndefined, startsWith, mimetypes, path*/
var nuMedia = angular.module('nu.Media', []);

nuMedia.service('nuMedia', ['$q',
    function($q) {
  'use strict';
  var NUMedia = function(type) {
    var $el = this.$el = angular.element('<' + type + '/>');
    var el = this.el = $el[0];

    this.available = !!el.canPlayType;
    
    angular.element(document.body).append($el.css('display', 'none'));
    //rawMedia.networkState

    this.toSource = function(blob, timeRange) {
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
        if(blob.type) {
          uri = blob.src;
          type = blob.type;
        } else { blob = blob.src; }
      }
      if ( isString(blob) ) { uri = blob; }

      //TODO: parse the timeRange object
      if(timeRange) { uri += '#t=' + timeRange; }

      if(uri) {
        var source = angular.element('<source/>').attr('src', uri);
        if(type) { source.attr('type', type); }
        return source;
      }
    };

    var nuMedia = this;
    function notify(name, data) {
      if(nuMedia.$deferred.notify) {
        var eventObj = {}; eventObj[name] = data;
        nuMedia.$deferred.notify(eventObj);
      }
    }

/*    $el.on('readystatechange progress seeking seeked loadstart loadedmetadata  error emptied abort', 
      function() { console.info(arguments[0].type, arguments); }); // ondurationchange*/
    
    $el.on('error emptied abort', function() {});

    $el.on('loadedmetadata', function() {
      nuMedia.$deferred.promise.media = {
        'duration': nuMedia.el.duration,
        'uri': nuMedia.$el.find('source').attr('src')
      };
      //TODO: read id3 tags to provied more details like `track title`, `artist`, `album` `album art`
      //TODO: should we digest root scope??
    });
    
    this.onStop = function onMediaStopOrEnd() {
      var target = nuMedia.current,
          completed = (nuMedia.el.currentTime === nuMedia.el.duration);

        if(nuMedia.$deferred && nuMedia.$deferred.promise.media &&
          startsWith(nuMedia.$deferred.promise.media.uri, 'blob:')) {
        URL.revokeObjectURL(nuMedia.$deferred.promise.media.uri);
      }
      nuMedia.current = null;
      
      //For FF need to set to empty string to create buffer.
      nuMedia.$el.attr('src', '').removeAttr('src').html('');
      if(nuMedia.$deferred.resolve) {
        nuMedia.$deferred.resolve({
          'end': {
            'target': target,
            'completed': completed
          }
        });
      }
    };

    $el.on('ended', this.onStop);
    
    $el.on('timeupdate durationchange', function(event) {
      notify('duration', {
        duration: event.target.currentTime,
        currentTime: event.target.duration,
        progress: (event.target.currentTime / event.target.duration)
      });
    });
  };
  //NuEventManager

  // timeRange = [start, end]
  // angular.extend(NUMedia.prototype, Array.prototype);
  NUMedia.prototype.play = function(src, timeRange) {
    if( this.current === src || (isUndefined(src) && this.el.duration) ) {
      this.el.play();
      return this.$deferred.promise;
    }//angular.lowercase

    var source;
    if( isFile(src) || isString(src) ) {
      source = this.toSource(src, timeRange);
    } else if ( isObject(src) ) {
      for(var index in src) {
        source = this.toSource(src[index], timeRange);
        if( source ) { break; }
      }
    }

    if(source) {
      this.stop();
      this.$deferred = $q.defer();
      this.$el.append(source);
      this.el.play();
      this.current = src;
    }
    return this.$deferred.promise;
  };
  
  NUMedia.prototype.pause = function() {
    if(this.el.duration) {
      this.el.pause();
      return this.current;
    }
  };
  
  NUMedia.prototype.stop = function() {
    if(this.el.duration) {
      this.pause();
      this.onStop();
    }
  };
  
  NUMedia.prototype.seek = function(timeRange) {};
  NUMedia.prototype.canPlay = function(blod) {
    return this.el.canPlayType(blod.type || blod);
  };

  var audio = new NUMedia('audio'),
      video = new NUMedia('video'),
      result = {'audio': audio, 'video': video};
  
  result.typeOf = function(blob) {
    if( isFile(blob) ) {
      if( startsWith(blob.type, 'audio') ) { return 'audio'; }
      else if( startsWith(blob.type, 'video') ) { return 'audio'; }
      else if( startsWith(blob.type, 'image') ) { return 'image'; }
      blob = blob.name;
    }
    if ( isString(blob) ) {
      var ext = path.splitext(blob)[1];
      if(ext) {
        for(var mediaType in mimetypes) { // mimetypes
          if(ext[0] === '.' && mimetypes[mediaType].indexOf(ext) !== -1) {
            return mediaType;
          }
        }
      }
    }
  };
  return result;
}]);

nuMedia.run(['$templateCache',
      function($templateCache) {
    'use strict';
    $templateCache.put('nu.button.view.icon.coin',
      '<div class="icon play"><div class="icon-inner"></div></div>'
    );
    $templateCache.put('nu.button.view.progress.coin',
      '<div class="progress"><div class="progress-inner"></div></div>'
    );

    $templateCache.put('nu.button.view.icon.box',
      '<div class="icon play"><div class="icon-inner"></div></div>'
    );
    $templateCache.put('nu.button.view.progress.box',
      '<div class="progress"><div class="progress-inner"></div></div>'
    );
  }
]);
