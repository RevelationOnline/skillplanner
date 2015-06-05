'use strict';

angular.module('skillplannerApp').directive('swgPyramidSkilltree', function($log){
  return {
    restrict: 'E',
    scope: {
      'skilltree': '=',
      'selectSkill': '&'
    },
    templateUrl: 'views/partial/pyramid_skilltree.html',
    controller: function($scope) {}
  };
});
