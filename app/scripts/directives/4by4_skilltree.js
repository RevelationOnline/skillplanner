'use strict';

angular.module('skillplannerApp').directive('swgFourByFourSkilltree', function($log){
  return {
    restrict: 'E',
    scope: {
      'skilltree': '=',
      'selectSkill': '&'
    },
    templateUrl: 'views/partial/4by4_skilltree.html',
    controller: function($scope) {


      function activate(skilltree) {
        if (typeof(skilltree) === 'undefined' || skilltree.graph_type !== '4by4') {
          $log.error('Not a four by 4 skilltree!', skilltree);
        }
      }

      $scope.$watch('skilltree', activate);
      activate();

    }
  };
});
