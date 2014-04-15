//  Demo app module
(function (angular) {
  var demo = angular.module('nu.Deno', ['nu.Switch', 'nu.PressButton', 'nu.List',
    'nu.FileChooser', 'nu.Show', 'nu.Src', 'nu.Slider', 'nu.Event', 'ngRoute']);

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
	  // $locationProvider.html5Mode(true);
	});

  //demo.directive('nuGist', function() {
    //
    // http://htmlpreview.github.io/?https://raw.github.com/twbs/bootstrap/gh-pages/2.3.2/index.html
    // http://jsfiddle.net/img/embeddable/logo.png
    // http://embed.plnkr.co/img/plunker.png
    // http://static.jsbin.com/images/jsbin_16.png
    // border: solid 1px #C6CACD;
    // color: #525252;
    // <script src="https://gist.github.com/gKodes/10728265.js"></script>
  //});

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['nu.Deno']);
  });
})(angular);