var testApp = angular.module('nu.test', [
  'ngRoute',
  'nu.Switch', 'nu.PressButton', 'nu.List', 'nu.FileChooser', 
    'nu.Show', 'nu.Src', 'nu.Slider', 'nu.Event'
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
  $scope.bump = function(){ $scope.list.push(Faker.Name.findName()); }
});

testApp.controller('listImgTest', function($scope, $log){
  $scope.$log = $log;
  $scope.list = ['imgs/sample1.gif', 'imgs/sample2.gif', 'imgs/sample3.gif', 'imgs/sample4.gif'];
});

testApp.controller('galleryTest', function($scope, $log){
  $scope.$log = $log;
  $scope.imgToPush = 'http://farm4.staticflickr.com/3724/13348717684_c67fde9929_b.jpg';
  $scope.gallery = ['http://farm4.staticflickr.com/3690/12852625125_849b3164cc_h.jpg',
    {src: 'http://farm9.staticflickr.com/8042/7918423710_e6dd168d7c_b.jpg', desc: 'Image 01'},
    {src: 'http://farm9.staticflickr.com/8449/7918424278_4835c85e7a_b.jpg', desc: 'Image 02'},
    {src: 'http://farm9.staticflickr.com/8457/7918424412_bb641455c7_b.jpg', desc: 'Image 03'},
    {src: 'http://farm9.staticflickr.com/8179/7918424842_c79f7e345c_b.jpg', desc: 'Image 04'},
    {src: 'http://farm9.staticflickr.com/8315/7918425138_b739f0df53_b.jpg', desc: 'Image 05'},
    {src: 'http://farm9.staticflickr.com/8461/7918425364_fe6753aa75_b.jpg', desc: 'Image 06'}
  ];
});

//http://farm8.staticflickr.com/7072/13349540283_fa28e565da_b.jpg
//http://farm8.staticflickr.com/7359/13351572553_2fd47e54b0_h.jpg

angular.element(document).ready(function() {
    angular.bootstrap(document, ['nu.test']);
});