'use strict';
angular.module('skillplannerApp').factory('SkillNameLookup', function($q, $http){
  var data = STATIC_DATA['skill_names'];
  return function(name) {
    return data[name] || name;
  };
});
