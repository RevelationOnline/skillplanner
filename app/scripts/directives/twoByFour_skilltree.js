'use strict';

angular.module('skillplannerApp').directive('swgTwoFourSkilltree', function($log){
  return {
    restrict: 'E',
    scope: {
      'skilltree': '=',
      'selectSkill': '&'
    },
    templateUrl: 'views/partial/twoByFour_skilltree.html',
    controller: function($scope) {}
  };
});
