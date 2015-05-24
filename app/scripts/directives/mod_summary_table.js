'use strict';
angular.module('skillplannerApp').directive('modSummaryTable', function(SummarizeMods){
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
            name:'Name',
            cellTemplate: '<div class="ui-grid-cell-contents" title="TOOLTIP"><stat-name stat="COL_FIELD"></stat-name></div>'
          },
          {field:'value', name:'Value', type: 'number'}
        ],
        data: []
      };

      $scope.$watch(function(){
        return Object.keys($scope.skills).length;
      }, function() {
        $scope.gridData.data = SummarizeMods($scope.skills, 'list');
      });
    }
  };
});
