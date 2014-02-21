describe('nu switch', function() {
  'use strict';
  /*global describe, beforeEach, expect, inject, module, it, angular, triggerEvent: true*/

  beforeEach(module('nu.switch'));
  var $scope, compile;

  beforeEach(function(){
    var $compile;
    inject(function (_$rootScope_, _$compile_) {
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
    it('having input name', function() {
      var button = compile('<nu-switch name="switchName"></nu-switch>');
      var input = button.find('input');
      
      expect(button).toBeTagName('div');
      expect(button).toNotHaveAttr('name');
      expect(input).toEqualAttr('name', 'switchName');
    });

    it('having same value for input id and label for', function() {
      var button = compile('<nu-switch></nu-switch>');
      var input = button.find('input');
      var label = button.find('label');

      expect(button).toNotHaveAttr('id');
      expect(input).toHaveAttr('id');
      expect(label).toEqualAttr('for', angular.element(input).attr('id'));
    });

    it('having same value for input id and label for using custom id value', function() {
      var button = compile('<nu-switch id="switchId"></nu-switch>');
      var input = button.find('input');
      var label = button.find('label');

      expect(button).toNotHaveAttr('id');
      expect(input).toEqualAttr('id', 'switchId');
      expect(label).toEqualAttr('for', 'switchId');
    });

    it('having label switch-off attr', function() {
      var button = compile('<nu-switch></nu-switch>');
      var label = button.find('label');

      expect(label).toEqualAttr('switch-off', 'Off');
    });

    it('having default label value as Yes', function() {
      var button = compile('<nu-switch></nu-switch>');
      var input = button.find('input');
      var label = button.find('label');

      input.checked = true;
      expect(label).toHaveText('On');
    });

    it('having input checked', function() {
      var button = compile('<nu-switch checked="checked"></nu-switch>');
      var input = button.find('input');

      expect(input[0].checked).toEqual(true);
    });
  });

  describe('with model', function() {

    it('value to be set to false by default', function() {
      var button = compile('<nu-switch ng-model="switchModel"></nu-switch>');
      var input = button.find('input');

      expect(button.scope().switchModel).toBeDefined();
      expect(button.scope().switchModel).toEqual(input[0].checked);
      expect(input[0].checked).toEqual(false);
    });

    it('value true using checked="checked" attr', function() {
      var button = compile('<nu-switch ng-model="switchModel" checked="checked"></nu-switch>');
      var input = button.find('input');

      expect(button.scope().switchModel).toBeDefined();
      expect(button.scope().switchModel).toEqual(input[0].checked);
      expect(input[0].checked).toEqual(true);
    });

    it('default initial value from scope', function() {
      $scope.switchModel = true;
      var button = compile('<nu-switch ng-model="switchModel"></nu-switch>');
      var input = button.find('input');

      expect($scope.switchModel).toBeDefined();
      expect($scope.switchModel).toEqual(input[0].checked);
      expect(input[0].checked).toEqual(true);
    });

    it('default initial value from scope override checked attr', function() {
      $scope.switchModel = false;
      var button = compile('<nu-switch ng-model="switchModel" checked="checked"></nu-switch>');
      var input = button.find('input');

      expect($scope.switchModel).toBeDefined();
      expect($scope.switchModel).toEqual(input[0].checked);
      expect(input[0].checked).toEqual(false);
    });

    it('runtime value change', function() {
      var button = compile('<nu-switch ng-model="switchModel"></nu-switch>');
      var input = button.find('input');
      button.scope().switchModel = true;
      $scope.$digest();

      expect(button.scope().switchModel).toBeDefined();
      expect(button.scope().switchModel).toEqual(input[0].checked);
      expect(input[0].checked).toEqual(true);

      button.scope().switchModel = false;
      $scope.$digest();

      expect(button.scope().switchModel).toBeDefined();
      expect(button.scope().switchModel).toEqual(input[0].checked);
      expect(input[0].checked).toEqual(false);
    });
  });

  describe('with custom labels', function() {

    it('labels attr check', function() {
      var button = compile('<nu-switch on="Yes" off="No" ng-model="switchModel"></nu-switch>');
      var label = button.find('label');

      expect(label).toEqualAttr('switch-off', 'No');
    });

    it('labels scope varibles check', function() {
      var button = compile('<nu-switch on="Yes" off="No" ng-model="switchModel"></nu-switch>');
      var input = button.find('input');
      var label = button.find('label');

      expect(button.scope().labelOn).toBeDefined();
      expect(button.scope().labelOn).toEqual('Yes');
      expect(button.scope().labelOff).toBeDefined();
      expect(button.scope().labelOff).toEqual('No');
      expect(button.scope().switchModel).toEqual('No');
      expect(label).toHaveText('Yes');
      input[0].checked = true;
      triggerEvent(input[0], 'change');
      expect(button.scope().switchModel).toEqual('Yes');
    });
  });
});