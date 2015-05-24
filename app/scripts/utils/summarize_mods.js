'use strict';
angular.module('skillplannerApp').factory('SummarizeMods', function(){
  /**
   * Summarize the mods of the given skills
   * You can use the optional format argument to switc into list mode which will give you a list of objects
   * rather than a simple object.
   * @param skills {Array} Array of selected skills
   * @param format {String} Can be set to 'list' to force list return values
   * @returns {Object|Array} contains the requested summary
   */
  function summarize(skills, format) {
    var list = (format === 'list' ? true : false);
    var mods = {};
    angular.forEach(skills, function (skill) {
      angular.forEach(skill.mods, function (val, key) {
        if (key.indexOf('private_') === -1) {
          var o = mods[key] || 0;
          o += val;
          mods[key] = o;
        }
      });
    });
    if (list) {
      var l = [];
      angular.forEach(mods, function (val, key) {
        l.push({
          'name': key,
          'value': val
        });
      });
      return l;
    } else {
      return mods;
    }
  }
  return summarize;
});
