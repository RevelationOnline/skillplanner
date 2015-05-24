'use strict';
angular.module('skillplannerApp').directive('modSummary', function(SummarizeMods){
  /**
   * Display a list-style summary of the mods in the selected skill(s).
   */
  return {
    restrict: 'E',
    scope: {
      'skills': '=?',
      'skill': '=?'
    },
    templateUrl:'views/partial/mod_summary.html',
    controller: function($scope) {
      $scope.mods = {};

      function summarize() {
        $scope.mods = SummarizeMods($scope.skills);
      }

      if ($scope.skills) {
        $scope.$watch(function () {
          return Object.keys($scope.skills).length;
        }, summarize, true);
      } else if ($scope.skill) {
        $scope.skills = [ $scope.skill ];

        $scope.$watch('skill', function (skill) {
          $scope.skills = [skill];
          summarize();
        });

      } else {
        $scope.skills = [];
      }
      summarize();
    }
  };

});
