/**
 * @license gl.typeahead.js 0.3
 * Copyright 2013 Kamalakar Gadireddy. and other contributors; https://github.com/gkodes/ngul
 * License: MIT
 */

(function(angular) {

angular.module("gl.typeahead", []);
var typeahead = angular.module("gl.typeahead");

var isArrayGtZero = typeahead.isArrayGtZero = function(val) {
	return ( Array.isArray(val) && val.length > 0 );
};

typeahead.directive("typeahead", function($parse, $templateCache, $timeout) {

	$templateCache.put("default.typeahead.template", "<p>{{suggestion}}</p>");

	var _keyMap = {
		9: 'tab',
		13: 'enter',
		27: 'esc',
		38: 'up',
		40: 'down'
	};
	
	var _style = {
		base : ["position: relative", "display: inline-block", "width:100%"].join(';'),
		hint : ["position: absolute", "top: 0", "left: 0", "border-color: transparent", "width: 100%", "height: 100%",
				"box-shadow: none", "background: none repeat scroll 0% 0% rgb(255, 255, 255)"].join(';'),
		suggestion : {
			list : ["position: absolute", "top: 100%", "left: 0", "z-index: 100", "display: block"].join(';'),
			set : ["display: inline-block", "width: 100%", "padding: 8px 0"].join(';')
		},
		input : [ "vertical-align: top", "background-color: transparent", "position: relative" ].join(';')
	};

	var _template = 
	['<span>',
		'<input type="text" spellcheck="off" autocomplete="off" class="hint" style="', _style.hint,'" ng-model="preview" disabled="disabled">',
		'<input type="text" class="query" ng-model="query" autocomplete="off" style="', _style.input,'">',
		'<span class="suggestion-list" style="', _style.suggestion.list,'" ng-if="suggestionOpen">',
			'<span class="suggestion-set" style="', _style.suggestion.set,'">',
				'<span class="suggestions">',
					'<div class="suggestion" style="display:block;" ng-repeat="suggestion in suggestions | limitTo:limit">', // 
						'<ng-include src="template">', // <ng-include src="tyTemplate"> <!-- list template -->
					'</div>',
				'</span>',
			'</span>',
		'</span>',
	'</span>'];
	
	return {
		restrict: 'ECA',
		replace: true,
		priority: 1,
		template: _template.join(''),
		scope: {
			limit: "@tyLimit",
			template: "@tyTemplate", // Need to add events also
		},
		compile: function compile(elm, attrs, transclude) {
			elm.attr({
				"style": _style.base
			}).removeClass(attrs['class']);

			var $input = angular.element(elm.find("input"));
			for(var attr in attrs.$attr) {
				if( attr.indexOf('ty') === -1 && attr !== "placeholder" ) {
					angular.noop(( attr === "class" )? $input.addClass(attrs[attr]): $input.attr(attr, attrs[attr]));
				}
			}

			$input = angular.element($input[1]);
			$input.attr('name', attrs.typeahead).attr('placeholder', attrs.placeholder);

			attrs.$set("tyLimit", attrs.tyLimit || 10);
			attrs.$set("tyDelay", attrs.tyDelay || 1000);
			attrs.$set("tyTemplate", attrs.tyTemplate || "default.typeahead.template");

			return function(scope, $elm, attrs, ctrl) {

				var prevQuery;

				var suggestion = (function(rootElement, queryInput) {
					var _s = {};
					_s.get = function(keyCode) {
						var node = null, i = 0;
						if( node = rootElement.getElementsByClassName("is-under-cursor")[0] ) {
							do {
								node = keyCode? { 38: node['previousSibling'], 
									40: node['nextSibling'] }[keyCode] : node;
								i++;
							} while(i < 2 && node && node.nodeType == 8);
						} else {
							var suggestions = rootElement.getElementsByClassName("suggestion");
							node = { 38: suggestions[suggestions.length - 1],
									40: suggestions[0] }[keyCode];
						}
						return node;
					};

					_s.set = function(node) {
						var prevNode = this.get();
						if( angular.isNumber(node) ) { node = this.get(node); }
						
						if( prevNode ) { angular.element( prevNode ).removeClass("is-under-cursor"); }
						if( node ) { angular.element( node ).addClass("is-under-cursor"); }

						if( $scope = this.$scope() ) {
							queryInput.value = $scope.suggestion.name? $scope.suggestion.name : $scope.suggestion;
							return $scope;
						}

						return null;
					};

					_s.select = function() {
						if( $scope = this.$scope() ) { // Note: don't use scope.query, as it would invoke the watch
							$scope.$emit("ty:Selected", attrs.typeahead);
							return $scope;
						}

						return undefined;
					};

					_s.$scope = function(keyCode) {
						if( node = this.get(keyCode) ) {
							return angular.element(node).scope();
						}
						return null;
					};

					_s.$emit = function() {
						if($scope = this.$get().scope()) {
							$scope.$emit(arguments);
						}
					};

					return _s;
				})($elm[0], $input[0]);

				$input
				.on("keydown", function tyKeydown(event) {
					var keyCode = (event.which || event.keyCode);
					if( !isArrayGtZero(scope.suggestions) || !_keyMap[keyCode]) {
						return;
					}

					if( scope.suggestionOpen && suggestion.get() ) {
						event.preventDefault();
					}

					scope.$apply(function() {
						scope.preview = undefined;
						if( keyCode == 38 || keyCode == 40 ) { // navigation
							suggestion.set(keyCode);
						}
					});
				})
				.on("keyup", function tyKeyup(event) {
					var keyCode = (event.which || event.keyCode);
					if( !isArrayGtZero(scope.suggestions) || !_keyMap[keyCode]) {
						return;
					}

					scope.$apply(function() {	
						if( keyCode == 9 || keyCode == 13 ) { // select the focused element on TAB or ENTER
							if( suggestion.select() ) {
								scope.suggestionOpen = false;
							}
						}
						else if( !(keyCode == 38 || keyCode == 40) ) {
							scope.suggestionOpen = false;
						}
					});
				})
				.on("focus", function tyFocus(event) { 
					if( scope.query && scope.query !== "" && isArrayGtZero(scope.suggestions) ) {
						scope.$apply(function(){ 
							scope.suggestionOpen = true;
						});
					}
				})
				.on("blur", function tyBlur(event) {
					scope.$apply(function(){ scope.suggestionOpen = false; }); 
				});

				$elm.on("mouseover", function tyMouseOver(event) {
					if(event.target.className == "suggestion ng-scope") {
						scope.$apply(function() {
							scope.preview = undefined;
							suggestion.set(event.target);
						});
					}
				})
				.on("mousedown", function tyMouseOut(event) {
					suggestion.select();
					scope.suggestionOpen = false;
				});

				var queryTimeOut;

				scope.$watch("suggestionOpen", function(open) {
					if(open) {
						var preview = scope.suggestions[0].name || scope.suggestions[0];
						if(preview.indexOf(scope.query)  === 0 && preview.indexOf($input[0].value) === 0) {
							scope.preview = preview;
						}
					}
					else { scope.preview = undefined; }

					scope.$emit(open? "ty:Opened" : "ty:Closed", attrs.typeahead);
				});

				scope.$watchCollection("suggestions", function(value) {
					if(!scope.query || scope.query === "") {
						scope.suggestions = value = [];
					}
					scope.suggestionOpen = isArrayGtZero(value);
				});

				scope.$watch("query", function(val) {
					scope.preview = undefined;
					scope.suggestionOpen = false;
					if(val && prevQuery !== val && val !== "") {
						scope.suggestions = [];
						if( queryTimeOut ) { $timeout.cancel(queryTimeOut); }
						scope.$emit("ty:Query", attrs.typeahead, val);
						queryTimeOut = $timeout(function(){							
							scope.$emit("ty:Query", attrs.typeahead, val);
						}, attrs.tyDelay);
						prevQuery = val;
					}
					suggestion.set();
				});

				scope.$emit("ty:Initialized", attrs.typeahead);
			};
		}
	};
});

})(angular);

if(typeof($script) !== "undefined" && typeof($script.done) === "function") { $script.done('gl.typeahead'); }