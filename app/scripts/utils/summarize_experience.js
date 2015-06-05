'use strict';
angular.module('skillplannerApp').factory('SummarizeExperience', function(){
  /**
   * Summarize the experience types of the given skills
   * You can use the optional format argument to switch into list mode which will give you a list of objects
   * rather than a simple object.
   * @param skills {Array} Array of selected skills
   * @param format {String} Can be set to 'list' to force list return values
   * @returns {Object|Array} contains the requested summary
   */
  function summarize(skills, format) {
    var list = (format === 'list' ? true : false);
    var exps = {};
    angular.forEach(skills, function (skill) {
        var e = skill.xp_type;
        if (e !== "") {
          exps[e] = (exps[e] || 0) + skill.xp_cost;
        }
    });
    if (list) {
      var l = [];
      angular.forEach(exps, function (val, key) {
        l.push({
          'name': key,
          'value': val
        });
      });
      return l;
    } else {
      return exps;
    }
  }
  return summarize;
});
