'use strict';
angular.module('skillplannerApp').directive('skillName', function(SkillNameLookup){
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
        /*SkillNameLookup.lookup($scope.skill.name).then(function (name) {
          $scope.name = name;
        });*/
        $scope.name = SkillNameLookup($scope.skill.name);
      }
      $scope.$watch('skill', resolve);
      resolve();

    }
  };
});
