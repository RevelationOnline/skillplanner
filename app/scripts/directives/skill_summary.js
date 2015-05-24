'use strict';
angular.module('skillplannerApp').directive('skillSummary', function(){
  return {
    restrict: 'E',
    scope: {
      'skills': '='
    },
    templateUrl:'views/partial/skill_summary.html',
  };
});
