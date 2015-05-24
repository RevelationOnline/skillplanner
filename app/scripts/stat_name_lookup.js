'use strict';
angular.module('skillplannerApp').factory('StatNameLookup', function(){
  var data = STATIC_DATA.stat_names;
  return function(name) {
    return data[name];
  };
});
