/*global describe, expect, by, it, browser, require: true*/ // element
//var nuList = require('./util.js').listNode;
var get_unit = require('./util.js').get_unit;

describe('nu list', function() {
  'use strict';

  it('should have 4 items each', function() {
    browser.get('#/nu.list');

    var unit = get_unit(1);
    unit.findAll(by.css('span.item')).then(function(nodes) {
      expect(nodes.length).toEqual(4);
    });

    unit = get_unit(2);
    unit.findAll(by.css('span.item')).then(function(nodes) {
      expect(nodes.length).toEqual(4);
    });

    unit = get_unit(3);
    unit.findAll(by.css('span.item')).then(function(nodes) {
      expect(nodes.length).toEqual(4);
    });

    unit = get_unit(4);
    unit.findAll(by.css('span.item')).then(function(nodes) {
      expect(nodes.length).toEqual(4);
    });

    unit = get_unit(5);
    unit.findAll(by.css('img')).then(function(nodes) {
      expect(nodes.length).toEqual(0);
    });
  });

  it('should have buffer for each', function() {
    var unit = get_unit(2);
    unit.findAll(by.css('span.buffer')).then(function(nodes) {
      expect(nodes.length).toEqual(1);
    });

    unit = get_unit(4);
    unit.findAll(by.css('span.buffer')).then(function(nodes) {
      expect(nodes.length).toEqual(1);
    });
  });

  it('should have 5 items after bump of list externally', function() {
    var unit = get_unit(1);
    unit.find('button').click().then(function(){
      unit.findAll(by.css('span.item')).then(function(nodes) {
        expect(nodes.length).toEqual(5);
      });
    });
  });

  it('should have 4 items after fifth is removed by clicking on it', function() {
    var unit = get_unit(1);
    unit.find('span.item', 4).click().then(function(){
      unit.findAll(by.css('span.item')).then(function(nodes) {
        expect(nodes.length).toEqual(5);
      });
    });
  });

  it('should not have buffer visible by default', function() {
    var unit = get_unit(2);
    unit.findAll(by.css('span.buffer')).then(function(nodes) {
      var attrExpected = function(value){ expect(value).toContain('hidden-buffer'); };
      for(var i = 0; i < nodes.length; i++) {
        nodes[i].getAttribute('class').then(attrExpected);
      }
    });
  });

  it('should set buffer="true" after which buffer would be visible', function() {
    var unit = get_unit(2);
    unit.find('button', 2).click().then(function(){
      unit.findAll(by.css('span.buffer')).then(function(nodes) {
        var attrExpected = function(value){ expect(value).toNotContain('hidden-buffer'); };
        for(var i = 0; i < nodes.length; i++) {
          nodes[i].getAttribute('class').then(attrExpected);
        }
      });
    });
  });

  it('should have 5 items after bump of list using buffer', function() {
    var unit = get_unit(2);
    unit.find('span.buffer').sendKeys('Test1\n').then(function() {
      unit.findAll(by.css('span.item')).then(function(nodes) {
        expect(nodes.length).toEqual(5);
        nodes[4].getText().then(function(value) {
          expect(value).toEqual('Test1');
        });
      });
    });
  });

  it('should have 4 items after remove one off the list from between', function() {
    var unit = get_unit(2);
    unit.find('span.item', 3).click().then(function() {
      unit.findAll(by.css('span.item')).then(function(nodes) {
        var attrExpected = function(value){ expect(value).not.toEqual('none'); };
        for(var i = 0; i < 4; i++) {
          nodes[i].getCssValue('display').then(attrExpected);
        }
      });
    });
  });

  it('should set buffer="false" after which buffer would not be visible', function() {
    var unit = get_unit(2);
    unit.find('button', 1).click().then(function(){
      unit.findAll(by.css('span.buffer')).then(function(nodes) {
        var attrExpected = function(value){ expect(value).toContain('hidden-buffer'); };
        for(var i = 0; i < nodes.length; i++) {
          nodes[i].getAttribute('class').then(attrExpected);
        }
      });
    });
  });

  it('should not be abale to delete items as `readonly="true"` ', function() {
    var unit = get_unit(3);
    unit.find('span.item', 4).click().then(function(){
      unit.findAll(by.css('span.item')).then(function(nodes) {
        expect(nodes.length).toEqual(4);
      });
    });
  });

  it('should have 4 items after click on the 4 as readonly="true"', function() {
    var unit = get_unit(4);
    unit.find('span.item', 4).click().then(function() {
      unit.findAll(by.css('span.item')).then(function(nodes) {
        expect(nodes.length).toEqual(4);
      });
    });
  });

  it('should set readonly="false" and remove all items', function() {
    var unit = get_unit(4);
    unit.find('button', 3).click().then(function() {
      for(var i = 4; i > 0; i--) {
        unit.find('span.item', i).click();
      }
    });
  });

  it('should have only two items pooled', function() {
    var unit = get_unit(4);
    unit.findAll(by.css('span.item')).then(function(nodes) {
      var attrExpected = function(value){ expect(value).toEqual('none'); };
      for(var i = 0; i < nodes.length; i++) {
        nodes[i].getCssValue('display').then(attrExpected);
      }
    });
  });

  it('should have no items in pool after adding two items', function() {
    var unit = get_unit(4);
    for(var i = 0; i < 2; i++) {
      unit.find('button', 1).click();
    }

    unit.findAll(by.css('span.item')).then(function(nodes) {
      expect(nodes.length).toEqual(2);
      var attrExpected = function(value){ expect(value).not.toEqual('none'); };
      for(var i = 0; i < nodes.length; i++) {
        nodes[i].getCssValue('display').then(attrExpected);
      }
    });
  });
});