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

testApp.controller('listTest', function($scope){
  $scope.list = ['Elm 1', 'Elm 2', 'Elm 3', 'Elm 4'];
});

angular.element(document).ready(function() {
    angular.bootstrap(document, ['nu.test']);
});