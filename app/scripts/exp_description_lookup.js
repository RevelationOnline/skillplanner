'use strict';
angular.module('skillplannerApp').factory('ExperienceDescriptionLookup', function(){
  var data = STATIC_DATA.exp_descriptions;
  return function(name) {
    return data[name];
  };
});
