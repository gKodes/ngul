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
    unit.findAll(by.css('span.item')).then(function(nodes) {
      expect(nodes.length).toEqual(4);
    });
  });

  it('should buffer for each', function() {
    var unit = get_unit(4);
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

  it('should not have buffer by default', function() {
    var unit = get_unit(2);
    unit.findAll(by.css('span.buffer')).then(function(nodes) {
      expect(nodes.length).toEqual(0);
    });
  });

  it('should have buffer after updating addable to "true"', function() {
    var unit = get_unit(2);
    unit.find('button', 2).click().then(function(){
      unit.findAll(by.css('span.buffer')).then(function(nodes) {
        expect(nodes.length).toEqual(1);
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

  it('should have buffer removed, updating addable to "false"', function() {
    var unit = get_unit(2);
    unit.find('button', 1).click().then(function(){
      unit.findAll(by.css('span.buffer')).then(function(nodes) {
        expect(nodes.length).toEqual(0);
      });
    });
  });

  it('should have 3 items after removing the forth', function() {
    var unit = get_unit(3);
    unit.find('span.item', 4).click().then(function(){
      unit.findAll(by.css('span.item')).then(function(nodes) {
        expect(nodes.length).toEqual(3);
      });
    });
  });

  it('should 4 items after click on a item as removable is "false"', function() {
    var unit = get_unit(4);
    unit.find('span.item', 4).click().then(function() {
      unit.findAll(by.css('span.item')).then(function(nodes) {
        expect(nodes.length).toEqual(4);
      });
    });
  });

  it('should 3 items after click on a item by setting removable is "true"', function() {
    var unit = get_unit(4);
    unit.find('button', 4).click().then(function() {
      unit.find('span.item', 4).click().then(function() {
        unit.findAll(by.css('span.item')).then(function(nodes) {
          expect(nodes.length).toEqual(3);
        });
      });
    });
  });

  it('should 3 items after click on a item by setting removable is "true"', function() {
    var unit = get_unit(4);
    unit.find('button', 3).click().then(function() {
      unit.find('span.item', 3).click().then(function() {
        unit.findAll(by.css('span.item')).then(function(nodes) {
          expect(nodes.length).toEqual(3);
        });
      });
    });
  });
});