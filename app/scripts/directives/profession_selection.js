'use strict';
angular.module('skillplannerApp').directive('professionSelection', function($log) {
  return {
    restrict: 'E',
    scope: {
      'skillTree': '=',
      'onClick': '&'
    },
    templateUrl: 'views/partial/profession_selection.html',
    controller: function($scope) {
      $scope.categories = {};

      /**
       * Categorize skills based on their prefix.
       */
      function categorize() {
        var categories = {};
        angular.forEach($scope.skillTree, function(profession){
          var category = profession.category;
          var c = categories[category] = categories[category] || {};
          c[profession.name] = profession;
        });
        //$scope.categories = categories;
        var keys = Object.keys(categories), count = keys.length;
        keys.sort();

        $scope.rows = [];
        if (count > 0) {
          var row = {};
          for (var i = 0; i < count; i++) {
            var c = keys[i];
            row[c] = categories[c];
            if (Object.keys(row).length >= 4) {
              $scope.rows.push(row);
              $log.debug(c, row);
              row = {};
            }
          }
          if (Object.keys(row).length > 0) {
            $scope.rows.push(row);
          }
        }
        $log.debug($scope.rows);
      }


      $scope.$watch(function(){
        return Object.keys($scope.skillTree).length;
      }, categorize);

      if ($scope.skillTree) {
        categorize();
      }
    }
  };
});
