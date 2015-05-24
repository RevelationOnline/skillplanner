'use strict';
angular.module('skillplannerApp').factory('Character', ['SkillData', '$log', function(_data, $log){
  var MAX_SKILLPOINTS = 250;


  /**
   * CharacterModel
   * holds data about potential characters and provides methods to ease using it.
   * @param name
   * @constructor
   */
  function CharacterModel(name) {
    var self = this;
    self.name = name;
    self.selectedSkills = {};
    self.skillPoints = MAX_SKILLPOINTS;
    self.skillTree = {};
    //self.initPromise = deferred.promise;

    self.skills = {};
    (function(data){
      /*
      TODO: This is rather ugly, we require this structure in each character, since the javascript deep copies can't(?)
      TODO: resolve self-referencing structures we are kind of stuck with this approach :(
       */
      data = angular.copy(data);
      self.skillTree = data;
      // now establish all the self-references for easier lookups
      var skills = self.skills;
      angular.forEach(data, function(professionData){
        var profession = professionData,
          novice = profession.novice,
          master = profession.master,
          lines = profession.trees;
        if (novice) {
          skills[novice.name] = novice;
        }

        if (master) {
          skills[master.name] = master;
        }
        master.profession = profession;
        novice.profession = profession;
        master.childs = [];
        novice.childs = [];
        angular.forEach(lines, function(line){
          var parent = novice;
          angular.forEach(line, function(skill) {
            skill.parent = novice;
            parent = skill;
            skills[skill.name] = skill;
            skill.childs = [];
            // do the reverse references so we can easily go back to the tree structure
            skill.line = line;
            skill.profession = profession;
            skill.selected = false;
          });
        });
      });
      // do all the skills_required so we can easily go back from them aswell
      angular.forEach(skills, function(skill) {
        var skills_required = [];
        angular.forEach(skill.skills_required, function(required_skill) {
          var s = skills[required_skill];
          if (s) {
            skills_required.push(s);
          }
        });
        skill.skills_required = skills_required;
        angular.forEach(skill.skills_required, function(s){
          s.childs.push(skill);
        });
      });
    })(_data);
    return this;
  }

  /**
   * Get the amount of skillpoints required to learn the given skill in addition to the current skills
   * @param self {Character}
   * @param skill {Object} skill to calculate requirements for
   * @returns {number} amount of skill points required, including the given skill
   * @private
   */
  CharacterModel.prototype.getSkillCosts = function getSkillCosts(skill, trace) {
    trace = trace || [];
    var cost = 0;
    if (!this.hasSkill(skill)) {
      cost += skill.skillpoint_cost;
      angular.forEach(skill.skills_required, function (required_skill) {
        if (!this.hasSkill(required_skill)) {
          if (trace.indexOf(required_skill) === -1) {
            trace.push(required_skill);
            cost += this.getSkillCosts( required_skill, trace);
          }
        }
      }, this);
    }
    return cost;
  };


  /**
   * Check if the character is able to lean the given skill.
   *
   * This checks wether or not the player has enough skillpoints to learn the given skill
   * and (if required) all it's skills_required.
   * @param (Object) skill
   * @return (Boolean) true if the character can learn this skill, false otherwise
   */
  CharacterModel.prototype.canLearn = function canLean(skill) {
    var self = this, skillPointsRequired = self.getSkillCosts(skill);
    $log.debug('skillPoints required:', skillPointsRequired);
    if (skillPointsRequired > self.skillPoints) {
      return false;
    } else {
      return true;
    }
  };
  /**
   * Check if this character has the given skill
   * @param {Object|String} name of the skill (String) or skill object to check for
   * @returns {boolean}
   */
  CharacterModel.prototype.hasSkill = function hasSkill(skill) {
    var skillName, selection;
    if (typeof(skill) === 'object') {
      skillName = skill.name;
    } else{
      skillName = skill;
    }
    selection = this.selectedSkills[skillName];
    if (typeof (selection) !== 'undefined') {
      return selection.selected;
    } else {
      return false;
    }
  };
  /**
   * Add the given skill the the character.
   * @param {String|Object} skill name of the skill or object to add
   * @private
   */
  CharacterModel.prototype.addSkill = function addSkill(skill) {
    var skillName = (typeof(skill) === 'object' ? skill.name : skill),
        mySkill = this.skills[skillName];
    if (!this.hasSkill(mySkill) && typeof(mySkill) !== 'undefined') {
      this.selectedSkills[skillName] = mySkill;
      mySkill.selected = true;
      this.skillPoints -= skill.skillpoint_cost;
    }
  };

  /**
   * Learn a skill
   * This learns the supplied skill and also all possible preq.
   * FIXME: we do ALOT of lookups to make sure we aren't overlearning skills.. this is SLOW....
   * @param {Object|String} skill skill to learn
   */
  CharacterModel.prototype.learnSkill = function learnSkill(skill) {

    if (this.canLearn(skill)) {
      // canLearn already checked for skillpoint requirements,
      // we just "add" from here on and do the skillpoints counting

      if (skill.profession.novice !== skill) {
        this.learnSkill(skill.profession.novice);
      }

      angular.forEach(skill.skills_required, function(s){
        if (!this.hasSkill(s)) {
          this.learnSkill(s);
        }
      }, this);

      this.addSkill(skill);

      $log.debug('Learned ', skill);
    } else {
      $log.error('Can\'t learn ', skill);
    }
  };

  /**
   * Unlearn a skill
   * This undoes learning, it also removes all skills that depend on the supplied skill
   * @param {String|Object} skill to unlearn
   */
  CharacterModel.prototype.unlearnSkill = function unlearnSkill(skill) {
    if (this.hasSkill(skill)) {
      if (skill.profession.novice === skill) {
        angular.forEach(skill.profession.trees, function(tree) {
          angular.forEach(tree, function(s){
            this.unlearnSkill(s);
          }, this);
        }, this);
      }
      if (skill !== skill.profession.master) {
        this.unlearnSkill(skill.profession.master);
      }
      angular.forEach(skill.childs, function(child){
        this.unlearnSkill(child);
      }, this);
      this.removeSkill(skill);
      $log.debug('unlearkning', skill);

    }
  };


  /**
   * Serialize the characters skills
   */
  CharacterModel.prototype.serializeSkills = function serializeSkills(){
    var professions = {};
    angular.forEach(this.selectedSkills, function(s) {
        professions[s.profession.name] = s.profession;
    });

    var selectedTiers = {};
    angular.forEach(professions, function(profession, name){
      if (!this.hasSkill(profession.novice)) {
        return;
      }
      if (this.hasSkill(profession.master)) {
        selectedTiers[name] = 'master';
      } else {
        var s = [0,0,0,0];
        angular.forEach(profession.trees, function(tree, treeIndex) {
          angular.forEach(tree, function(skill, skillIndex){
            if (!this.hasSkill(skill)) {
              return;
            }
            var v = skillIndex + 1;
            if (v > s[treeIndex]) {
              s[treeIndex] = v;
            }
          }, this);
        }, this);
        var selection =  s.join('');
        if (selection === '0000') {
          selection='novice';
        }
        selectedTiers[name] = selection;
      }
    }, this);
    var result = [];
    angular.forEach(selectedTiers, function(selection, professionName){
      result.push(professionName + ':' + selection);
    });
    return result.join(',');
  };

  /**
   * Deserialize the given string
   * @param {String} serialized skill selection
   */
  CharacterModel.prototype.deserialize = function deserializeSkills(s) {
    var parts = s.split(','), professions = {};
    angular.forEach(parts, function(part){
      var tokens = part.split(':');

      if (tokens.length === 2) {
        var profession = this.skillTree[tokens[0]];

        if (profession && !professions[profession.name]) {
          var sel = tokens[1];
          if (sel === 'master') {
            professions[profession.name] = [profession.master];
          } else if (sel === 'novice') {
            professions[profession.name] = [profession.novice];
          } else {
            var tiers = sel.split('');
            professions[profession.name] = [];
            angular.forEach(profession.trees, function(tree, index) {
              var i = tiers[index], n = i -1;
              if (i === 0) {
                return;
              }

              if (n >= 0 && n <= (tree.length - 1)) {
                professions[profession.name].push(tree[n]);
              }
            });
          }
        }
      }
    }, this);
    angular.forEach(professions, function(skills) {
      $log.debug('Learning ', skills);
      angular.forEach(skills, this.learnSkill, this);
    }, this);
  };

  /**
   * Check if it is safe to remove the skill
   * It does check if there are still any child skills pending on this
   *
   * @param {Object|String} skill
   */
  CharacterModel.prototype.canRemoveSkill = function canRemoveSkill(skill) {
    var self = this;
    if (this.hasSkill(skill)) {
      var canRemove = true;
      angular.forEach(skill.childs, function(child){
        canRemove = canRemove && !self.hasSkill(child);
      });
      return canRemove;
    } else {
      return false;
    }
  };

  /**
   * Remove the given skill
   * @param {Object|String} skill name of object of string to remove
   * @param {Boolean} force remove even if there are skills depending on this
   */
  CharacterModel.prototype.removeSkill = function removeSkill(skill, force){
    force = force || false;
    if (this.hasSkill(skill)) {
      var mySkill = (typeof(skill) === 'object' ? this.selectedSkills[skill.name] : this.selectedSkills[skill]);
      delete this.selectedSkills[mySkill.name];
      mySkill.selected = false;
      this.skillPoints += mySkill.skillpoint_cost;
    }
  };

  /**
   * Reset the current skill select
   */
  CharacterModel.prototype.reset = function reset() {
    angular.forEach(this.selectedSkills, this.removeSkill, this);
  };


  return CharacterModel;
}]);
