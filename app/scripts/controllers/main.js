'use strict';

/**
 * @ngdoc function
 * @name skillplannerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the skillplannerApp
 */
angular.module('skillplannerApp')
  .controller('MainCtrl', function ($scope, $log, Character, $location) {
    var default_profession = 'combat_marksman';
    $scope.profession = null;
    $scope.professions = {};
    $scope.character = null;

    function updateProfessions() {
      var professions = {};
      angular.forEach($scope.character.skillTree, function(val, key){
        if (val.novice.selected) {
          professions[key] = val;
        }
      });
      $scope.professions = professions;
    }

    $scope.reset = function reset(){
      var character = new Character();
      $scope.character = character;
      $scope.profession = character.skillTree[default_profession];
      updateProfessions();
    };


    $scope.selectProfession = function(profession) {
      $scope.profession = profession;
    };

    $scope.selectSkill = function selectSkill(skill) {
      var c = $scope.character;
      if (!c.hasSkill(skill)) {
        c.learnSkill(skill);
      } else {
        c.unlearnSkill(skill);
      }
    };

    $scope.removeProfession = function removeProfession(profession) {
      $scope.character.unlearnSkill(profession.novice);
    };

    $scope.$watch(function(){
      if ($scope.character) {
        return Object.keys($scope.character.selectedSkills).length;
      }
      return -1;
    }, function(){
      updateProfessions();
      $location.hash($scope.character.serializeSkills());
      //$log.debug('current skillset:' +);
    });

    $scope.reset();

    // deserialize the profession list
    var hash = $location.hash();
    if (hash !== '') {
      $scope.character.deserialize(hash);

      // initialize with the "last" box learned, should be better then the default selection
      // when the user already made a selection
      var s = $scope.character.selectedSkills, keys = Object.keys(s);
      if (keys.length > 0) {
        $scope.selectProfession(s[keys[keys.length-1]].profession);
      }
    }
  });
