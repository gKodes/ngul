/*global describe, by, expect, it, browser, require: true*/ // element
var pressButtonNode = require('./util.js').pressButtonNode;
var util = require('./util.js');

var get_unit = util.get_unit;

describe('nu switch', function() {
  'use strict';

  it('should have input checked to false', function() {
    browser.get('#/nu.pb');

    var unit = get_unit(1);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    
    expect(derivative.input.isSelected()).toEqual(false);
    unit.result().then(function(value) {
      expect(value).toEqual('');
    });

    expect(derivative.labelOn.isDisplayed()).toEqual(true);
    expect(derivative.labelOff.isDisplayed()).toEqual(false);
    derivative.labelOn.click().then(function(){
      unit.result().then(function(value) {
        expect(value).toEqual('true');
      });
      expect(derivative.labelOn.isDisplayed()).toEqual(false);
    });

    expect(derivative.input.isSelected()).toEqual(true);
    expect(derivative.labelOff.isDisplayed()).toEqual(true);
    derivative.labelOff.click().then(function(){
      unit.result().then(function(value) {
        expect(value).toEqual('false');
      });
    });

    expect(derivative.labelOn.isDisplayed()).toEqual(true);
    expect(derivative.labelOff.isDisplayed()).toEqual(false);
  });
/*
  it('should have input checked to false', function() {
    var unit = get_unit(1);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    
    expect(derivative.input.isSelected()).toEqual(false);
    unit.result().then(function(value) {
      expect(value).toEqual('');
    });
  });
*/
});