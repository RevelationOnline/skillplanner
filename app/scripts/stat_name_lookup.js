'use strict';
angular.module('skillplannerApp').factory('StatNameLookup', function($q, $http){
  var data = STATIC_DATA['stat_names'];
  return function(name) {
    return data[name];
  }
});
