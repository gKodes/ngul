/*global describe, expect, it, browser, process, require: true*/ // element
var fileChooser = require('./util.js').fileChooser;
var get_unit = require('./util.js').get_unit;

describe('nu file chooser', function() {
  'use strict';

  it('should have label as "My Fav Song.mp3"', function() {
    browser.get('#/nu.file.chooser');

    var unit = get_unit(1);
    var derivative = new fileChooser(unit.find('.nu.file.chooser'));
    
    derivative.span.getText().then(function(value) {
      expect(value).toEqual('My Fav Song.MP3');
    });
  });


  it('should have ext as mp3', function() {
    var unit = get_unit(1);
    var derivative = new fileChooser(unit.find('.nu.file.chooser'));
    
    derivative.label.getAttribute('ext').then(function(value) {
      expect(value).toEqual('mp3');
    });
  });


  it('should select "Gruntfile.js" file', function() {
    var unit = get_unit(1);
    var derivative = new fileChooser(unit.find('.nu.file.chooser'));
    derivative.input.sendKeys(process.cwd() + '/Gruntfile.js');
    
    derivative.span.getText().then(function(value) {
      expect(value).toEqual('Gruntfile.js');
    });

    derivative.label.getAttribute('ext').then(function(value) {
      expect(value).toEqual('js');
    });
  });
});