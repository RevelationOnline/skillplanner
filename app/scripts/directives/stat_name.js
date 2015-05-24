'use strict';
angular.module('skillplannerApp').
  run(function($http, $log){
    $log.debug('test');
  })
  .directive('statName', function(StatNameLookup){
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      'stat': '='
    },
    template:'{{name}}',
    controller: function($scope) {
      $scope.name = 'Loading...';
      function resolve() {
        if (!$scope.stat) {
          return;
        }
        /*StatNameLookup.lookup($scope.mod).then(function (name) {
          $log.debug(name);
          $scope.name = name;
        }, function(error){
          $log.error('statName: ' + error);
        });*/
        $scope.name = StatNameLookup($scope.stat);
      }
      $scope.$watch('skill', resolve);
      resolve();

    }
  };
});
