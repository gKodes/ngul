//  Demo app module
(function (angular) {
  var demo = angular.module('nu.Deno', ['nu.switch', 'nu.pb', 'nu.list',
    'nu.file.chooser', 'nu.show', 'nu.slider', 'ngRoute']);

	demo.config(function($routeProvider, $locationProvider) {
	  $routeProvider
    .when('/nuSwitch', {
	    templateUrl: 'pages/Switch.html',
	    controller: angular.noop
    })
	  .when('/nuPressButton', {
	    templateUrl: 'pages/PB.html',
	    controller: angular.noop
	  })
    .when('/nuList', {
      templateUrl: 'pages/List.html',
      controller: angular.noop
    })
    .when('/nuFileChooser', {
      templateUrl: 'pages/FC.html',
      controller: angular.noop
    })
    .when('/nuShow', {
      templateUrl: 'pages/Show.html',
      controller: angular.noop
    })
    .when('/', {
      templateUrl: 'pages/Main.html',
      controller: angular.noop
    });
	 
	  // configure html5 to get links working on jsfiddle
	  $locationProvider.html5Mode(true);
	});

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['nu.Deno']);
  });
})(angular);