'use strict';
angular.module('skillplannerApp').directive('skillDescription', function(SkillDescriptionLookup){
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      'skill': '='
    },
    template:'{{name}}',
    controller: function($scope) {
      $scope.name = 'Loading...';
      function resolve() {
        if (!$scope.skill) {
          return;
        }
        /*SkillDescriptionLookup.lookup($scope.skill.name).then(function (name) {
          $scope.name = name;
        });*/
        $scope.name = SkillDescriptionLookup($scope.skill.name);
      }
      $scope.$watch('skill', resolve);
      resolve();

    }
  };
});
