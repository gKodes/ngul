/*global describe, expect, it, browser, console, require: true*/ // element
var show = require('./util.js').show;
var get_unit = require('./util.js').get_unit;

describe('nu show', function() {
  'use strict';

  describe('with an ngModel', function() {
    var unit, derivative;
    it('shold have 5 images', function() {
      browser.get('#/nu.show');

      unit = get_unit(1);
      derivative = new show(unit.find('.nu.show'));
      derivative.findImgs().then(function(images) {
        expect(images.length).toEqual(7);
      });
    });

    it('should got in loop forward direction', function() {
      derivative.findImgs().then(function(images) {
        /* jshint -W083 */
        for(var i = 0; i < images.length; i ++) {
          derivative.next.click(function() {
            expect(derivative.isActive(i + 1)).toEqual('active');
          });
        }
        expect(derivative.isActive(1)).toEqual('active');
        /* jshint +W083 */
      });
    });

    it('should got in loop backword direction', function() {
      derivative.findImgs().then(function(images) {
        /* jshint -W083 */
        for(var i = images.length; i > 0; i--) {
          derivative.previous.click(function() {
            expect(derivative.isActive(i)).toEqual('active');
          });
        }
        expect(derivative.isActive(1)).toEqual('active');
        /* jshint +W083 */
      });
    });

    it('shold have 8 images by adding one', function() {
      unit.find('button', 1).click(function() {
        derivative.findImgs.then(function(images) {
          expect(images.length).toEqual(8);
        });
      });
    });

    it('shold have focus on last image', function() {
      derivative.previous.click(function() {
        expect(derivative.isActive(8)).toEqual('active');
      });
    });

    it('shold have 7 images by removing one', function() {
      unit.find('button', 2).click(function() {
        derivative.findImgs(function(images) {
          expect(images.length).toEqual(7);
        });
      });
    });

    it('shold have focus on first image', function() {
      expect(derivative.isActive(1)).toEqual('active');
    });
  });
});