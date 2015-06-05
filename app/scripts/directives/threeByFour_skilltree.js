'use strict';

angular.module('skillplannerApp').directive('swgThreeFourSkilltree', function($log){
  return {
    restrict: 'E',
    scope: {
      'skilltree': '=',
      'selectSkill': '&'
    },
    templateUrl: 'views/partial/threeByFour_skilltree.html',
    controller: function($scope) {}
  };
});
