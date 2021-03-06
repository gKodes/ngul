/*global describe, expect, it, browser, require: true*/ // element
var pressButtonNode = require('./util.js').pressButtonNode;
var get_unit = require('./util.js').get_unit;

describe('nu press button', function() {
  'use strict';

  it('should have input checked to false', function() {
    browser.get('#/nu.pb');

    var unit = get_unit(1);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    
    expect(derivative.input.isSelected()).toEqual(false);
  });

  it('should have result as blank', function() {
    var unit = get_unit(1);
    
    unit.result().then(function(value) {
      expect(value).toEqual('');
    });
  });

  it('should have input and result as TRUE on click', function() {
    var unit = get_unit(1);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    
    derivative.labelOff.click().then(function(){
      expect(derivative.input.isSelected()).toEqual(true);
      unit.result().then(function(value) {
        expect(value).toEqual('true');
      });
    });
  });


  it('should have label ON diaplayed', function() {
    var unit = get_unit(1);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));

    expect(derivative.labelOn.isDisplayed()).toEqual(true);
    expect(derivative.labelOff.isDisplayed()).toEqual(false);
  });

  it('should have input and result as FALSE on click', function() {
    var unit = get_unit(1);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));

    derivative.labelOn.click().then(function(){
      expect(derivative.input.isSelected()).toEqual(false);
      unit.result().then(function(value) {
        expect(value).toEqual('false');
      });
    });
  });

  it('should have label OFF diaplayed', function() {
    var unit = get_unit(1);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));

    expect(derivative.labelOff.isDisplayed()).toEqual(true);
  });

  it('should have different icons for different states', function() {
    var unit = get_unit(2);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    
    derivative.labelOff.getAttribute('class').then(function(value){
      expect(value).toEqual('fa fa-flag-o');
    });
    derivative.labelOn.getAttribute('class').then(function(value){
      expect(value).toEqual('fa fa-flag');
    });
  });

  it('should have result as "Working" on click', function() {
    var unit = get_unit(2);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    
    derivative.labelOff.click().then(function(){
      unit.result().then(function(value) {
        expect(value).toEqual('Working');
      });
    });
  });


  it('should have result as "" on click', function() {
    var unit = get_unit(2);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    
    derivative.labelOn.click().then(function(){
      unit.result().then(function(value) {
        expect(value).toEqual('');
      });
    });
  });

  it('should have result as "Working" and checked by default', function() {
    var unit = get_unit(3);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    
    expect(derivative.input.isSelected()).toEqual(true);
    unit.result().then(function(value) {
      expect(value).toEqual('Working');
    });
  });

  it('should have result as "It\'s Off" and unchecked on click', function() {
    var unit = get_unit(3);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    
    derivative.labelOn.click().then(function(){
      unit.result().then(function(value) {
        expect(value).toEqual('It\'s Off');
      });
    });
  });

  describe('type="radio"', function(){
    var unit, derivative;
    it('should have result as ""', function() {
      unit = get_unit(4);
      derivative = [new pressButtonNode(unit.find('.nu.button.press', 1)),
        new pressButtonNode(unit.find('.nu.button.press', 2))];
      
      unit.result().then(function(value) {
        expect(value).toEqual('');
      });
    });

    it('should have input\'s not checked', function() {
      expect(derivative[0].input.isSelected()).toEqual(false);
      expect(derivative[1].input.isSelected()).toEqual(false);
    });

    it('should have first switch input checked & result as "Case1" on click', function() {
      derivative[0].labelOff.click().then(function(){
        unit.result().then(function(value) {
          expect(value).toEqual('Case1');
        });
      });
    });

    it('should have first switch label ON visible & OFF Hidden', function() {
      expect(derivative[0].labelOn.isDisplayed()).toEqual(true);
      expect(derivative[0].labelOff.isDisplayed()).toEqual(false);
    });

    it('should have second switch input checked & result as "Case2" on click', function() {
      derivative[1].labelOff.click().then(function(){
        unit.result().then(function(value) {
          expect(value).toEqual('Case2');
        });
      });
    });

    it('should have second switch label ON visible & OFF Hidden', function() {
      expect(derivative[1].labelOn.isDisplayed()).toEqual(true);
      expect(derivative[1].labelOff.isDisplayed()).toEqual(false);
    });
  });

  it('should disabled & value should not change on click', function() {
    var unit = get_unit(5);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
      derivative.labelOff.click().then(function(){
        unit.result().then(function(value) {
          expect(value).toEqual('');
        });
        expect(derivative.labelOff.isDisplayed()).toEqual(true);
        expect(derivative.labelOn.isDisplayed()).toEqual(false);
      });
  });

  it('should have default value as true as set in scope', function() {
    var unit = get_unit(6);

    unit.result().then(function(value) {
      expect(value).toEqual('true');
    });
  });

  it('should disabled & value should not change on click', function() {
    var unit = get_unit(6);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    expect(derivative.labelOff.isDisplayed()).toEqual(false);
    expect(derivative.labelOn.isDisplayed()).toEqual(true);

    unit.find('button', 1).click().then(function() {
      derivative.labelOn.click().then(function() {
        unit.result().then(function(value) {
          expect(value).toEqual('false');
        });
      });
    });

    unit.find('button', 2).click().then(function() {
      derivative.labelOff.click().then(function() {
        unit.result().then(function(value) {
          expect(value).toEqual('false');
        });
        expect(derivative.labelOff.isDisplayed()).toEqual(true);
        expect(derivative.labelOn.isDisplayed()).toEqual(false);
      });
    });
  });


  it('should not have ng-model', function() {
    var unit = get_unit(7);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    expect(derivative.labelOff.isDisplayed()).toEqual(true);
    expect(derivative.labelOn.isDisplayed()).toEqual(false);

    derivative.labelOff.click().then(function() {
      expect(derivative.labelOff.isDisplayed()).toEqual(false);
      expect(derivative.labelOn.isDisplayed()).toEqual(true);
    });

    derivative.labelOn.click().then(function() {
      expect(derivative.labelOff.isDisplayed()).toEqual(true);
      expect(derivative.labelOn.isDisplayed()).toEqual(false);
    });
  });

  it('should not have ng-model', function() {
    var unit = get_unit(7);
    var derivative = new pressButtonNode(unit.find('.nu.button.press'));
    expect(derivative.labelOff.isDisplayed()).toEqual(true);
    expect(derivative.labelOn.isDisplayed()).toEqual(false);

    derivative.labelOff.click().then(function() {
      expect(derivative.labelOff.isDisplayed()).toEqual(false);
      expect(derivative.labelOn.isDisplayed()).toEqual(true);
    });

    derivative.labelOn.click().then(function() {
      expect(derivative.labelOff.isDisplayed()).toEqual(true);
      expect(derivative.labelOn.isDisplayed()).toEqual(false);
    });
  });

  describe('only with nu-change (no ng-model)', function() {
    it('should have result as true on click', function() {
      var unit = get_unit(7);
      var derivative = new pressButtonNode(unit.find('.nu.button.press'));

      derivative.labelOff.click().then(function() {
        unit.result().then(function(value) {
          expect(value).toEqual('true');
        });
      });
    });

    it('should have result as false on click', function() {
      var unit = get_unit(7);
      var derivative = new pressButtonNode(unit.find('.nu.button.press'));

      derivative.labelOn.click().then(function() {
        unit.result().then(function(value) {
          expect(value).toEqual('false');
        });
      });
    });
  });

  describe('with "id" attribute', function() {
    var unit, derivative;

    it('should have input and result as TRUE on click', function() {
      unit = get_unit(8);
      derivative = new pressButtonNode(unit.find('.nu.button.press'));
  
      derivative.labelOff.click().then(function(){
        expect(derivative.input.isSelected()).toEqual(true);
        unit.result().then(function(value) {
          expect(value).toEqual('true');
        });
      });
    });

    it('should have label ON diaplayed', function() {
      expect(derivative.labelOn.isDisplayed()).toEqual(true);
      expect(derivative.labelOff.isDisplayed()).toEqual(false);
    });

    it('should have input and result as FALSE on click', function() {
      derivative.labelOn.click().then(function(){
        expect(derivative.input.isSelected()).toEqual(false);
        unit.result().then(function(value) {
          expect(value).toEqual('false');
        });
      });
    });

    it('should have label OFF diaplayed', function() {
      expect(derivative.labelOff.isDisplayed()).toEqual(true);
    });
  });
});