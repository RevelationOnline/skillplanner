'use strict';

angular.module('skillplannerApp').directive('swgSkill', function(){
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      'skill': '=',
      'selectSkill': '&'
    },
    templateUrl: 'views/partial/skill.html',
    controller: function($scope) {
      $scope.popoverTemplate = 'views/partial/skill_popover.html';
    }
  };
});
