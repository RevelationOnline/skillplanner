'use strict';
angular.module('skillplannerApp').directive('modSummaryTable', function(SummarizeMods, StatNameLookup){
  /**
   * Display a (sortable) table (using ui-grid) showing the mods of the given skills.
   */
  return {
    restrict: 'E',
    scope: {
      'skills': '='
    },
    templateUrl: 'views/partial/mod_summary_table.html',
    controller: function($scope) {
      $scope.gridData = {
        enableSorting: true,
        columnDefs: [
          {
            field:'name',
            name:'Name'
          },
          {field:'value', name:'Value', type: 'number'}
        ],
        data: []
      };

      $scope.$watch(function(){
        return Object.keys($scope.skills).length;
      }, function() {
        var summary = SummarizeMods($scope.skills, 'list');
        angular.forEach(summary, function(item) {
          item.name = StatNameLookup(item.name);
        });

        $scope.gridData.data = summary;
      });
    }
  };
});
