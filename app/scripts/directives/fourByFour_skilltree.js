'use strict';

angular.module('skillplannerApp').directive('swgFourByFourSkilltree', function($log){
  return {
    restrict: 'E',
    scope: {
      'skilltree': '=',
      'selectSkill': '&'
    },
    templateUrl: 'views/partial/fourByFour_skilltree.html',
    controller: function($scope) {}
  };
});
