describe('nu press button', function() {
  'use strict';
  /*global describe, beforeEach, expect, inject, module, it, angular, createEvent: true*/
  beforeEach(module('nu.pb'));
  var $scope, $document, compile;

  beforeEach(function(){
    var $compile;
    inject(function (_$rootScope_, _$compile_, _$document_) {
      $scope = _$rootScope_;
      $compile = _$compile_;
    });

    compile = function (markup, scope) {
      scope = scope? scope : $scope;
      var node = $compile(markup)(scope);
      scope.$digest();
      return node;
    };
  });

  describe('with defaults', function() {
    it('checkbox type', function() {
      var button = compile('<nu-press-button></nu-press-button>');
      var input = button.find('input');

      expect(button).toBeTagName('div');
      expect(input).toEqualAttr('type', 'checkbox');
    });

    it('radio type', function() {
      var button = compile('<nu-press-button type="radio"></nu-press-button>');
      var input = button.find('input');

      expect(input).toEqualAttr('type', 'radio');
    });

    it('having input name', function() {
      var button = compile('<nu-press-button name="pbname"></nu-press-button>');
      var input = button.find('input');
      
      expect(button).toNotHaveAttr('name');
      expect(input).toEqualAttr('name', 'pbname');
    });
  });

  //TODO: Labels & Icons
});