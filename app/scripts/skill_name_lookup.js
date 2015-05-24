'use strict';
angular.module('skillplannerApp').factory('SkillNameLookup', function(){
  var data = STATIC_DATA.skill_names;
  return function(name) {
    return data[name] || name;
  };
});
