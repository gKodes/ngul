/*global exports, angular, by, require: true*/
exports.pressButtonNode = function(node) {
  'use strict';
  this.labelOn = node.findElement(by.css('label:nth-of-type(2)'));
  this.labelOff = node.findElement(by.css('label:nth-of-type(1)'));
  this.input = node.findElement(by.tagName('input'));
};

exports.switchNode = function(node) {
  'use strict';
  this.label = node.findElement(by.tagName('label'));
  this.input = node.findElement(by.tagName('input'));

  this.click = function() {
    return this.label.click();
  };
};

exports.listNode = function(node) {
  'use strict';

  this.buffer = function() {
    return node.findElement(by.css('.buffer'));
  };

  this.node = function(index) {
    index = index? 1 : index;
    return node.findElement(by.css('span:nth-of-type(' + index + ')'));
  };
};

var unit = function(node) {
  'use strict';
  this.node = node;
  
  this.result = function() {
    return this.node.findElement(by.css('[result]')).getText();
  };

  this.find = function(locator, index) {
    if( typeof locator === 'string' ) {
      locator = by.css(locator + (index? ':nth-of-type(' + index + ')' : ''));
    }
    return this.node.findElement(locator);
  };

  this.findAll = function(locator, pipe) {
    return this.node.findElements(locator);
  };

  this.$digest = function() {
    return browser.executeScript('angular.element(arguments[0]).scope().$digest();', this.node);
  };
};

//var promise = require('selenium-webdriver').promise;

exports.get_unit = function(index) {
  return new unit(element(by.css('[unit]:nth-of-type(' + index + ')')));
};