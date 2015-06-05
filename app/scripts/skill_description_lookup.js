'use strict';
angular.module('skillplannerApp').factory('SkillDescriptionLookup', function(){
  var data = STATIC_DATA.skill_descriptions;
  return function(name) {
    return data[name];
  };
});
