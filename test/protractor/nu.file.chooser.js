/*global describe, expect, it, browser, process, require: true*/ // element
var find = require('./util.js').find;
var get_unit = require('./util.js').get_unit;

describe('nu file chooser', function() {
  'use strict';

  describe('single select', function() {
    var unit, derivative,
        dumyMp3 = 'http://freedownloads.last.fm/download/637051290/Mortal.mp3';

    it('defult label should be "Mortal.mp3"', function() {
      browser.get('#/nu.file.chooser');

      unit = get_unit(1);
      derivative = find.nuFileChooser(unit);
      expect(derivative.firstItem.getText()).toEqual('Mortal.mp3');
    });

    it('should have ext as mp3', function() {
      expect(derivative.firstItem.getAttribute('ext')).toEqual('mp3');
    });

    /* Not sure how to achive this
    it('on click should remove the current item', function() {
      derivative.firstItem.click().then(function() {
        derivative.items().then(function(items) {
          var idx = items.length;
          while (idx--) {
            expect(items[idx].getCssValue('display')).toEqual('none');
          }
        });
      });
    });*/

    /*it('change the item by using buffer', function() {
    });*/
  });
});