describe('gl.typeahead tests', function () {

	var $scope, $compile, $document, $timeout;
	var changeInputValueTo;

	var suggestions = [
		"Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii",
		"Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
		"Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York",
		"North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
		"Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"
	];

	beforeEach(module('gl.typeahead'));
	beforeEach(inject(function (_$rootScope_, _$compile_, _$document_, _$timeout_, $sniffer) {
		$scope = _$rootScope_;
		
		$compile = _$compile_;
		$document = _$document_;
		$timeout = _$timeout_;
		
		changeInputValueTo = function (element, value)
		{
			var inputEl = findInput(element);
			inputEl.val(value);
			inputEl.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
			$scope.$digest();
		};
	}));

	beforeEach(function () {
		this.typeahead = $compile(angular.element('<input class="form-control" type="text" typeahead="test">'))($scope);
		this.input_hint = this.typeahead.find('input')[0];
		this.input_user = this.typeahead.find('input')[1];
		$scope.$on("ty:Query", function(event, name, query) {
			event.targetScope.suggestions = suggestions;
		});
		$scope.$digest();
	});

	//custom matchers
	beforeEach(function () {
		this.addMatchers({
			hasClass: function (hasClass) {  return angular.element(this.actual).hasClass(hasClass); },
			attrEqual: function(attr, val) { return angular.element(this.actual).attr(attr) === val; }		
		});
	});

	describe('initial state and tags check', function () {
		it('did directive replace base', function() {
			expect(this.typeahead.length).toEqual(1);
		});

		it('is outer structure created', function() {
			expect(this.typeahead[0].tagName.toLowerCase()).toEqual('span');
		});

		describe('input hint structure check', function() {
			it('has hint class', function() {
				expect(this.input_hint).hasClass('hint');
			});

			it('is autocomplete off', function() {
				expect(this.input_hint).attrEqual("autocomplete", "off");
			});

			it('is spellcheck off', function() {
				expect(this.input_hint).attrEqual("spellcheck", "off");
			});

			it('is disabled', function() {
				expect(this.input_hint).attrEqual("disabled", "disabled");
			});
		});

		it('user input structure check', function() {
			expect(this.typeahead.find('input')).hasClass('form-control');
		});

		it('copyed class of base', function() {
			expect(this.typeahead.find('input')).hasClass('form-control');
		});
	});

	function triggerEvent(target, name, fn) {
		var event = document.createEvent('Event');
		event.initEvent(name, true, true);
		fn(event);

		target.dispatchEvent(event);
	}

	function keyPress(target, keyCode) {
		triggerEvent(target, 'keydown', function(event){ event.which = keyCode; });
		triggerEvent(target, 'keyup', function(event){ event.which = keyCode; });
	}

	describe('on user input', function() {
		it('triggers queryChanged', function() {
			var typeaheadScope = this.typeahead.scope();
			typeaheadScope.$apply(function() {
				typeaheadScope.query = "test";
			});
			$scope.$digest();

			waitsFor(function() {
				return this.typeahead.find('span').length > 0;				
			}, "Wating for ty:Query trigger", 2500);
		});

		describe('suggession list', function() {
			beforeEach(function () {
				var typeaheadScope = this.typeaheadScope = this.typeahead.scope();
				typeaheadScope.$apply(function() {
					typeaheadScope.query = "test";
				});
				$scope.$digest();
			});

			it("open", function() {
				waitsFor(function() {
					return this.typeaheadScope.suggestionOpen;
				}, "is Suggession Open", 2500);
			});

			it("triggers escKeyed", function() {
				keyPress(this.input_user, 27);
			});

			it("triggers upKey", function() {
				waitsFor(function() {
					return this.typeaheadScope.suggestionOpen;
				}, "wailt for suggestion open", 2500);

				keyPress(this.input_user, 38);

				var _suggestions = this.typeahead.find('div');
				return expect(_suggestions[_suggestions.length - 1]).hasClass('is-under-cursor');
			});

			it("triggers downKey", function() {
				waitsFor(function() {
					return this.typeaheadScope.suggestionOpen;
				}, "wailt for suggestion open", 2500);

				keyPress(this.input_user, 40);

				expect(this.typeahead.find('div')[0]).hasClass('is-under-cursor');
			});

			it("suggestions check", function() {
				waitsFor(function() {
					return this.typeaheadScope.suggestionOpen;
				}, "wailt for suggestion open", 2500);

				var _ps = this.typeahead.find('p');
				for(var i = 0; i < _ps.length; i++) {
					expect(_ps[i].innerHTML).toEqual(suggestions[i]);
				}
			});

			it("triggers enterKey", function() {
				var selectedVal;
				$scope.$on("ty:Selected", function(event) { selectedVal = event.targetScope.suggestion; });

				keyPress(this.input_user, 40);
				keyPress(this.input_user, 13);

				expect(selectedVal).toEqual(suggestions[0]);
			});

			it("triggers enterTab", function() {
				var selectedVal;
				$scope.$on("ty:Selected", function(event) { selectedVal = event.targetScope.suggestion; });

				keyPress(this.input_user, 38);
				keyPress(this.input_user, 9);
	
				expect(selectedVal).toEqual(suggestions[9]);
			});

			it("list down word select each", function() {
				var selectedVal;
				$scope.$on("ty:Selected", function(event) { selectedVal = event.targetScope.suggestion; });

				for(var i = 0; i < 10; i++) {
					keyPress(this.input_user, 40);
					expect(this.typeahead.find('div')[i]).hasClass('is-under-cursor');
				}
			});

			it("list up word select each", function() {
				var selectedVal;
				$scope.$on("ty:Selected", function(event) { selectedVal = event.targetScope.suggestion; });

				for(var i = 9; i > -1; i--) {
					keyPress(this.input_user, 38);
					expect(this.typeahead.find('div')[i]).hasClass('is-under-cursor');
				}
			});

			xit("max limit change at runtime", function() {
				var selectedVal;
				$scope.$on("ty:Selected", function(event) { selectedVal = event.targetScope.suggestion; });

				keyPress(this.input_user, 38);
				keyPress(this.input_user, 9);
				this.typeahead.attr('ty-limit', 20);
				$scope.$digest();
	
				return expect(selectedVal).toEqual(suggestions[19]);
			});
		});
	});
});