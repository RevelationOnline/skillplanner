'use strict';

angular.module('skillplannerApp').directive('swgOneByFourSkilltree', function($log){
  return {
    restrict: 'E',
    scope: {
      'skilltree': '=',
      'selectSkill': '&'
    },
    templateUrl: 'views/partial/oneByFour_skilltree.html',
    controller: function($scope) {}
  };
});
