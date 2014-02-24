/*global describe, expect, it, browser, require: true*/ // element
var switchNode = require('./util.js').switchNode;
var get_unit = require('./util.js').get_unit;

describe('nu switch', function() {
  'use strict';
  it('should have input checked to false', function() {
    browser.get('#/nu.switch');

    var unit = get_unit(1);
    var derivative = new switchNode(unit.find('.nu.switch'));

    expect(derivative.input.isSelected()).toEqual(false);
    unit.result().then(function(value) {
      expect(value).toEqual('');
    });
  });

  it('should have input checked to true on click', function() {
    var unit = get_unit(1);
    var derivative = new switchNode(unit.find('.nu.switch'));

    derivative.click().then(function() {
      expect(derivative.input.isSelected()).toEqual(true);
      unit.result().then(function(value) {
        expect(value).toEqual('true');
      });
    });
  });

  it('having checked attribute', function() {
    var unit = get_unit(2);

    var derivative = new switchNode(unit.find('.nu.switch'));
    expect(derivative.input.isSelected()).toEqual(true);
    derivative.click().then(function() {
      unit.result().then(function(value) {
        expect(value).toEqual('false');
      });
    });
  });

  describe('custom label', function(){
    var unit = get_unit(3);

    it('check the custom label', function() {
      var derivative = new switchNode(unit.find('.nu.switch'));
      derivative.label.getText().then(function(value) {
        expect(value).toEqual('Yes');
      });
      derivative.label.getAttribute('label-off').then(function(value) {
        expect(value).toEqual('No');
      });
    });
  });

  describe('custom value', function(){
    it('on switch on', function() {
      var unit = get_unit(4);
      var derivative = new switchNode(unit.find('.nu.switch'));
      derivative.click().then(function() {
        unit.result().then(function(value) {
          expect(value).toEqual('Working');
        });
      });

      derivative.click().then(function() {
        unit.result().then(function(value) {
          expect(value).toEqual('');
        });
      });
    });

    it('for both on and off', function() {
      var unit = get_unit(5);
      var derivative = new switchNode(unit.find('.nu.switch'));
      unit.result().then(function(value) {
        expect(value).toEqual(''); // It\'s Off
      });

      derivative.click().then(function() {
        unit.result().then(function(value) {
          expect(value).toEqual('Working');
        });
      });

      derivative.click().then(function() {
        unit.result().then(function(value) {
          expect(value).toEqual('It\'s Off');
        });
      });
    });


  });
});

describe('multiple radio nu switchs', function() {
  'use strict';
  var unit,derivative;
  it('should have first input checked to true', function() {
    unit = get_unit(6);
    derivative = [new switchNode(unit.find('.nu.switch')),
      new switchNode(unit.find('.nu.switch', 2))];

    derivative[0].click().then(function() {
      expect(derivative[0].input.isSelected()).toEqual(true);
      expect(derivative[1].input.isSelected()).toEqual(false);
      unit.result().then(function(value) {
        expect(value).toEqual('Case1');
      });
    });
  });

  it('should have second input checked to true', function() {
    derivative[1].click().then(function() {
      expect(derivative[0].input.isSelected()).toEqual(false);
      expect(derivative[1].input.isSelected()).toEqual(true);
      unit.result().then(function(value) {
        expect(value).toEqual('Case2');
      });
    });
  });
});
