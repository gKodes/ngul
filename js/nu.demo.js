//  Demo app module
(function (angular) {
  var demo = angular.module('nu.Deno', ['nu.switch', 'nu.pb', 'nu.list',
    'nu.file.chooser', 'nu.show', 'nu.slider', 'ngRoute']);

	demo.config(function($routeProvider, $locationProvider) {
	  $routeProvider
    .when('/ngul/nuSwitch', {
	    templateUrl: '/ngul/pages/Switch.html',
	    controller: angular.noop
    })
	  .when('/ngul/nuPressButton', {
	    templateUrl: '/ngul/pages/PB.html',
	    controller: angular.noop
	  })
    .when('/ngul/nuList', {
      templateUrl: '/ngul/pages/List.html',
      controller: angular.noop
    })
    .when('/ngul/nuFileChooser', {
      templateUrl: '/ngul/pages/FC.html',
      controller: angular.noop
    })
    .when('/ngul/nuShow', {
      templateUrl: '/ngul/pages/Show.html',
      controller: angular.noop
    })
    .when('/ngul', {
      templateUrl: '/ngul/pages/Main.html',
      controller: angular.noop
    });
	 
	  // configure html5 to get links working on jsfiddle
	  $locationProvider.html5Mode(true);
	});

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['nu.Deno']);
  });
})(angular);