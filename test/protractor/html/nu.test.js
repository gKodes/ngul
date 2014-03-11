var testApp = angular.module('nu.test', [
  'ngRoute',
  'nu.pb',
  'nu.list',
  'nu.switch',
  'nu.file.chooser',
  'nu.gallery',
  'nu.slider'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/:path', {templateUrl: function(parameters){
    return 'partial/' + parameters['path'] + '.html'
  }, controller: angular.noop });
}]);

testApp.controller('listTest', function($scope, $log){
  $scope.$log = $log;
  //array_element
  //$scope.list = Faker.Lorem.words(Faker.random.number(15));
  $scope.list = ['Elm 1', 'Elm 2', 'Elm 3', 'Elm 4'];
});

testApp.controller('listImgTest', function($scope, $log){
  $scope.$log = $log;
  $scope.list = ['imgs/sample1.gif', 'imgs/sample2.gif', 'imgs/sample3.gif', 'imgs/sample4.gif'];
});

testApp.controller('galleryTest', function($scope, $log){
  $scope.$log = $log;
  $scope.gallery = ['http://farm4.staticflickr.com/3690/12852625125_849b3164cc_h.jpg',
    {src: 'http://farm9.staticflickr.com/8042/7918423710_e6dd168d7c_b.jpg', desc: 'Image 01'},
    {src: 'http://farm9.staticflickr.com/8449/7918424278_4835c85e7a_b.jpg', desc: 'Image 02'},
    {src: 'http://farm9.staticflickr.com/8457/7918424412_bb641455c7_b.jpg', desc: 'Image 03'},
    {src: 'http://farm9.staticflickr.com/8179/7918424842_c79f7e345c_b.jpg', desc: 'Image 04'},
    {src: 'http://farm9.staticflickr.com/8315/7918425138_b739f0df53_b.jpg', desc: 'Image 05'},
    {src: 'http://farm9.staticflickr.com/8461/7918425364_fe6753aa75_b.jpg', desc: 'Image 06'}
  ];
});

angular.element(document).ready(function() {
    angular.bootstrap(document, ['nu.test']);
});