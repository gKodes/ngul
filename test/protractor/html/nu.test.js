var testApp = angular.module('nu.test', [
  'ngRoute',
  'nu.pb',
  'nu.list',
  'nu.switch',
  'nu.file.chooser'
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

angular.element(document).ready(function() {
    angular.bootstrap(document, ['nu.test']);
});