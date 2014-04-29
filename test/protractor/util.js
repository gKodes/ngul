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

exports.show = function(node) {
  'use strict';
  this.next = node.findElement(by.css('a:nth-of-type(1)'));
  this.previous = node.findElement(by.css('a:nth-of-type(2)'));
  this.isActive = function(index) {
    return node.findElement(by.css('img:nth-of-type(' + index + ')')).getAttribute('class');
  };
  this.findImgs = function() { return node.findElements(by.tagName('img')); };
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

exports.find = {
  nuWrap: function(unit) {
    'use strict';
    var node = unit.find('.nu.wrap');
    node.anchor = node.findElement(by.tagName('a'));
    node.input = node.findElement(by.tagName('input'));
    return node;
  },
  nuFileChooser: function(unit) {
    'use strict';
    var node = unit.find('.nu.list.file');
    node.firstItem = node.findElement(by.css('.list.item'));
    node.items = function() {
      return node.findElements(by.css('.list.item'));
    };
    node.buffer = node.findElement(by.css('.buffer'));
    //console.info(node.firstItem, node.buffer);
    return node;
  }
};

exports.fileChooser = function(node) {
  'use strict';
  this.label = node;
  this.span = node.findElement(by.tagName('span'));
  this.input = node.findElement(by.tagName('input'));
};


exports.Key = {
  NULL:         '\uE000',
  CANCEL:       '\uE001',  // ^break
  HELP:         '\uE002',
  BACK_SPACE:   '\uE003',
  TAB:          '\uE004',
  CLEAR:        '\uE005',
  RETURN:       '\uE006',
  ENTER:        '\uE007',
  SHIFT:        '\uE008',
  CONTROL:      '\uE009',
  ALT:          '\uE00A',
  PAUSE:        '\uE00B',
  ESCAPE:       '\uE00C',
  SPACE:        '\uE00D',
  PAGE_UP:      '\uE00E',
  PAGE_DOWN:    '\uE00F',
  END:          '\uE010',
  HOME:         '\uE011',
  ARROW_LEFT:   '\uE012',
  LEFT:         '\uE012',
  ARROW_UP:     '\uE013',
  UP:           '\uE013',
  ARROW_RIGHT:  '\uE014',
  RIGHT:        '\uE014',
  ARROW_DOWN:   '\uE015',
  DOWN:         '\uE015',
  INSERT:       '\uE016',
  DELETE:       '\uE017',
  SEMICOLON:    '\uE018',
  EQUALS:       '\uE019',

  NUMPAD0:      '\uE01A',  // number pad keys
  NUMPAD1:      '\uE01B',
  NUMPAD2:      '\uE01C',
  NUMPAD3:      '\uE01D',
  NUMPAD4:      '\uE01E',
  NUMPAD5:      '\uE01F',
  NUMPAD6:      '\uE020',
  NUMPAD7:      '\uE021',
  NUMPAD8:      '\uE022',
  NUMPAD9:      '\uE023',
  MULTIPLY:     '\uE024',
  ADD:          '\uE025',
  SEPARATOR:    '\uE026',
  SUBTRACT:     '\uE027',
  DECIMAL:      '\uE028',
  DIVIDE:       '\uE029',

  F1:           '\uE031',  // function keys
  F2:           '\uE032',
  F3:           '\uE033',
  F4:           '\uE034',
  F5:           '\uE035',
  F6:           '\uE036',
  F7:           '\uE037',
  F8:           '\uE038',
  F9:           '\uE039',
  F10:          '\uE03A',
  F11:          '\uE03B',
  F12:          '\uE03C',

  COMMAND:      '\uE03D',  // Apple command key
  META:         '\uE03D'   // alias for Windows key
};