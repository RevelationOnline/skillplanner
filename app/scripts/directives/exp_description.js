'use strict';
angular.module('skillplannerApp').directive('experienceDescription', function(ExperienceDescriptionLookup){
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
        $scope._name = ExperienceDescriptionLookup($scope.name);
      }
      $scope.$watch('name', resolve);
      resolve();

    }
  };
});
