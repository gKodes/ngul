var find = require('./util.js').find;
var get_unit = require('./util.js').get_unit;

describe('nu wrap', function() {
  'use strict';

  describe('type="text" with out Model', function() {
    var nuWrap,
        typeText = 'Message It Off For Mee';
    
    it('should have placeholder value for the view', function() {
      browser.get('#/nu.wrap');

      nuWrap = find.nuWrap(get_unit(1));

      expect(nuWrap.anchor.getInnerHtml()).toEqual(
        nuWrap.input.getAttribute('placeholder'));
    });

    it('should not have editor visible', function() {
      expect(nuWrap.input.getCssValue('opacity')).toEqual('0');
    });

    it('should show editor on click of the view', function() {

      expect(nuWrap.getAttribute('class')).toContain('ws-view');

      nuWrap.anchor.click().then(function() {
        expect(nuWrap.input.getCssValue('opacity')).not.toEqual('0');
        expect(nuWrap.anchor.getCssValue('opacity')).not.toEqual('1');
      });    
    });

    it('should be able type text into editor', function() {
      nuWrap.input.sendKeys(typeText + '\n');
      expect(nuWrap.input.getCssValue('opacity')).not.toEqual('1');
    });

    it('should have same text for editor and view', function() {
      expect(nuWrap.input.getCssValue('opacity')).not.toEqual('0');
      expect(nuWrap.anchor.getInnerHtml()).toEqual(typeText);
    });
  });


  describe('type="text" with Model', function() {
    var unit, nuWrap,
        typeText = 'Message It Off For Mee',
        extText = 'Updated model not from nuWrap';
    
    it('should have placeholder value for the view', function() {
      unit = get_unit(2);
      nuWrap = find.nuWrap(unit);

      expect(nuWrap.anchor.getInnerHtml()).toEqual(
        nuWrap.input.getAttribute('placeholder'));
      expect(unit.result()).toEqual('');
    });

    it('should show editor on click of the view', function() {

      expect(nuWrap.getAttribute('class')).toContain('ws-view');

      nuWrap.anchor.click().then(function() {
        expect(nuWrap.input.getCssValue('opacity')).not.toEqual('0');
        expect(nuWrap.anchor.getCssValue('opacity')).not.toEqual('1');
      });    
    });

    it('should be able type text into editor', function() {
      nuWrap.input.sendKeys(typeText + '\n');
      expect(nuWrap.input.getCssValue('opacity')).not.toEqual('1');
    });

    it('should have the model update with the editor value', function() {
      expect(unit.result()).toEqual(typeText);
    });

    it('should have same text for editor and view', function() {
      expect(nuWrap.input.getCssValue('opacity')).toEqual('0');
      expect(nuWrap.anchor.getInnerHtml()).toEqual(typeText);
    });

    it('should have model update using external input', function() {
      var outsideInput = unit.find(by.tagName('input'));
      outsideInput.clear();
      outsideInput.sendKeys(extText);
      expect(unit.result()).toEqual(extText);
    });

    it('should have external update text in view & editor', function() {
      expect(nuWrap.anchor.getInnerHtml()).toEqual(extText);
      expect(nuWrap.input.getAttribute('value')).toEqual(extText);
    });
  });
});