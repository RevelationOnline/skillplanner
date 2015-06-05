'use strict';
angular.module('skillplannerApp').directive('experienceName', function(ExperienceNameLookup){
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      'name': '='
    },
    template:'{{_name}}',
    controller: function($scope) {
      function resolve() {
        if (!$scope.name) {
          return;
        }
        $scope._name = ExperienceNameLookup($scope.name);
      }
      $scope.$watch('skill', resolve);
      resolve();
    }
  };
});
