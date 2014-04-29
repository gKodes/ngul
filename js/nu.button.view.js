/*global angular, extend, isDefinedAndNotNull*/
var nuButtonView = angular.module('nu.ButtonView', ['nu.Media']);

nuButtonView.service('nuButtonViewTypes', ['$templateCache',
  function($templateCache) {
    'use strict';
    var buttonCtrlBase = {
      setIcon: function(name) {
        this.removeIcon();
        if(name) { this.el.icon.addClass(name); }
      },
      removeIcon: function() {
        this.el.icon.removeClass('image replay play pause stop');
      },
      progressReset: function() {
        this.progressUpdate({duration: {progress: 0}});
      }
    };

    var nuButtonViewTypes = {
      'coin': function(element) {
        this.el = {};
        this.el.icon = angular.element(
              $templateCache.get('nu.button.view.icon.coin') );
        this.el.progress = angular.element(
              $templateCache.get('nu.button.view.progress.coin') );
        var ctrl = this;

        element.append(this.el.icon).append(this.el.progress);

        this.progressUpdate = function(evt) {
          if(evt.duration) {
            var position = 'rotate(' + (evt.duration.progress + 0.12) + 'turn)';
            ctrl.el.progress.css({
              '-webkit-transform': position,
              '-moz-transform': position,
              'transform': position
            });
          }
        };
      },
      'box': function(element) {
        this.el = {};
        this.el.icon = angular.element(
              $templateCache.get('nu.button.view.icon.box') );
        this.el.progress = angular.element(
              $templateCache.get('nu.button.view.progress.box') );
        var ctrl = this;

        element.append(this.el.icon).append(this.el.progress);
        var rawProgress = this.el.progress[0];

        this.progressUpdate = function(evt) {
          if(evt.duration) {
            ctrl.el.progress.css('box-shadow',
              'inset ' + Math.floor(rawProgress.clientWidth * evt.duration.progress) +
              'px 0px 0px 0px rgba(53, 126, 189, 0.5)');
          }
        };
      },
      'fcbox': function(element) {
        this.el = {};
        this.el.icon = angular.element(
              $templateCache.get('nu.button.view.icon.box') );
        this.el.progress = element.parent();
        var ctrl = this;

        element.append(this.el.icon);
        var rawProgress = this.el.progress[0];

        this.progressUpdate = function(evt) {
          if(evt.duration) {
            ctrl.el.progress.css('box-shadow',
              'inset ' + Math.floor(rawProgress.clientWidth * evt.duration.progress) +
              'px 0px 4px 0px rgba(53, 126, 189, 1)');
          }
        };

        this.progressReset = function() {
          ctrl.el.progress.css('box-shadow', 'none');
        };
      }
    };

    extend(nuButtonViewTypes.coin.prototype, buttonCtrlBase);
    extend(nuButtonViewTypes.box.prototype, buttonCtrlBase);
    extend(nuButtonViewTypes.fcbox.prototype, buttonCtrlBase);

    var result = {
      bind: function(type, element) {
        return new nuButtonViewTypes[type](element);
      },
      defaultIcon: {
        audio: 'play', image: 'image'
      }
    };

    result.defaultIcon.video = result.defaultIcon.audio;
    return result;
  }
]);

nuButtonView.directive('nuButtonView', ['nuMedia', 'nuButtonViewTypes',
  function(nuMedia, nuButtonViewTypes) {
    'use strict';
    var _template =
      '<div class="nu button view">' +
        '<input type="radio" style="display: none;"/>' +
      '</div>';

    return {
      template: _template,
      restrict: 'EACM',
      replace: true,
      require: '?ngModel',
      // controller: NuButtonViewController, nuButtonView
      link: function(scope, element, attrs, ngModel) {
        var type = attrs.nuButtonView || 'coin',
            typeCtrl = nuButtonViewTypes.bind(type, element),
            mediaType,
            isPlaying = false,
            isMedia = false,
            isImage = false;

        element.addClass(type);

        function mediaEnd(evt) {
          if( isPlaying ) {
            if(evt.end) {
              typeCtrl.setIcon(evt.end.completed? 'replay' : 'play');
              typeCtrl.progressReset();
            }
            isPlaying = false;
          }
        }
        
        function playPause() {
          if(isPlaying) {  nuMedia.audio.pause(); }
          else { nuMedia.audio.play(ngModel.$viewValue).then(
            mediaEnd, mediaEnd, typeCtrl.progressUpdate); }
          isPlaying = !isPlaying;
          typeCtrl.setIcon(isPlaying? 'pause' : 'play');
        }

        function showImage() {}

        ngModel.$render = function() {
          if(isPlaying && nuMedia[mediaType]) {
            nuMedia[mediaType].stop();
          }
          typeCtrl.progressReset();

          mediaType = nuMedia.typeOf(ngModel.$viewValue);
          if( isDefinedAndNotNull(mediaType) ) {
            isMedia = isImage = false;
            isImage = mediaType === 'image';
            isMedia = !isImage;
          }

          typeCtrl.setIcon(nuButtonViewTypes.defaultIcon[mediaType]);
        };

        element.on('click', function() {
          if(isMedia) { playPause(); }
          else if(isImage) { showImage(); }
          event.stopPropagation();
        });
      }
    };
  }
]);
