//  Demo app module
(function (angular) {
  var demo = angular.module('nu.Deno', ['nu.switch', 'nu.pb', 'nu.list',
    'nu.file.chooser', 'nu.gallery', 'nu.slider']);

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['nu.Deno']);
  });
})(angular);