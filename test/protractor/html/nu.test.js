angular.module('nu.test', [
  'ngRoute',
  'nu.pb',
  'nu.list',
  'nu.switch',
  'nu.file.chooser'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/:path', {templateUrl: function(parameters){
    return parameters['path'] + '.html'
  }, controller: angular.noop });
}]);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['nu.test']);
});