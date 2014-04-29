//  Demo app module
(function (angular) {
  var demo = angular.module('nu.Deno', ['nu.Switch', 'nu.PressButton', 'nu.List',
    'nu.FileChooser', 'nu.Show', 'nu.Src', 'nu.Slider', 'nu.Wrap', 'ngRoute']);

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

  demo.controller('demo.input.inline', ['$scope', 
    function($scope) {
      $scope.user = "demo";
      $scope.email = "sample@gmail.com";
      $scope.password = "admin123";
    }
  ]);

  demo.controller('demo.select.inline', ['$scope', 
    function($scope) {
      $scope.colors = [
        {name:'black', shade:'dark'},
        {name:'white', shade:'light'},
        {name:'red', shade:'dark'},
        {name:'blue', shade:'dark'},
        {name:'yellow', shade:'light'}
      ];
      $scope.color = $scope.colors[2]; 
    }
  ]);

  demo.controller('demo.textarea.inline', ['$scope', 
    function($scope) {
      $scope.textArea = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi dolor diam, feugiat ac vehicula elementum, condimentum sit amet odio. Ut blandit ante lacus, id sagittis dui euismod eu. Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer vitae velit vitae mauris commodo pretium.'; 
    }
  ]);


  demo.controller('demo.switch.separated', ['$scope', 
    function($scope) {
      $scope.sampleTwo = true;
      $scope.sampleThree = 'Bike';
    }
  ]);

  demo.controller('demo.pb', ['$scope', 
    function($scope) {
      $scope.myLove = 'Hart Broken :\'-(';
      $scope.groupCurrency = 'Quid';
    }
  ]);

  demo.controller('demo.fc', ['$scope', 
    function($scope) {
      $scope.sampleOne = 'http://freedownloads.last.fm/download/626522452/Flow.mp3';
    }
  ]);

  demo.controller('demo.tags', ['$scope', 
    function($scope) {
      $scope.demo = [
        "Group",
        "Collection",
        "Manipulate",
        "Easy"
      ];
    }
  ]);

  demo.controller('demo.show', ['$scope', 
    function($scope) {
      $scope.gallery = [
        {src: 'http://farm9.staticflickr.com/8179/7918424842_c79f7e345c_b.jpg', desc: 'Image 04'},
        'http://farm9.staticflickr.com/8042/7918423710_e6dd168d7c_b.jpg',
        'http://farm9.staticflickr.com/8449/7918424278_4835c85e7a_b.jpg',,
        {src: 'http://farm9.staticflickr.com/8457/7918424412_bb641455c7_b.jpg', desc: 'Image 03'},
        {src: 'http://farm9.staticflickr.com/8315/7918425138_b739f0df53_b.jpg', desc: 'Image 05'},
        {src: 'http://farm9.staticflickr.com/8461/7918425364_fe6753aa75_b.jpg', desc: 'Image 06'}
      ];
    }
  ]);

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['nu.Deno']);
  });
})(angular);