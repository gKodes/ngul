/*global angular*/
var nuWrapBS = angular.module('nu.Wrap.bs', []);

nuWrap.run(['$templateCache', function($templateCache) {
  'use strict';
  /**
   * Show the input with an single addon showing ok/warning signs
   */
  $templateCache.put('nu.wrap.bs.status',
		'<div class="input-group">' +
		  '<wrap-in></wrap-in>' +
		  '<span class="input-group-addon show-editor">' +
		    '<span ng-class="{\'glyphicon-warning-sign\': !$valid, \'glyphicon-ok\': $valid}" class="glyphicon"></span>' +
		  '</span>' +
		'</div>');

  /**
   * Show the input with an two addion one for accept other for reset
   */
  $templateCache.put('nu.wrap.bs.acceptReject',
		'<div class="input-group">' +
		  '<wrap-in></wrap-in>' +
		  '<span class="input-group-addon show-editor" ng-click="$valid && accept(); show(!$valid);">' +
		    '<span class="glyphicon" ng-class="{\'glyphicon-warning-sign\': !$valid, \'glyphicon-ok\': $valid}"></span>' +
		  '</span>' +
		  '<span class="input-group-addon show-editor" ng-click="reset(); show(false);">' +
		    '<span class="glyphicon glyphicon-remove"></span>' +
		  '</span>' +
		'</div>');
}]);