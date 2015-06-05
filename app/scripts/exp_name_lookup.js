'use strict';
angular.module('skillplannerApp').factory('ExperienceNameLookup', function(){
  var data = STATIC_DATA.exp_names;
  return function(name) {
    return data[name] || name;
  };
});
