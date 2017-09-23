const settings = require('../settings');

export const roleTower = {

  run: function (tower) {
    if (tower && tower.energy > 0) {
      var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

      if (closestHostile) {
        tower.attack(closestHostile);
      } else {
        var creep = tower.pos.findClosestByRange(_.filter(Game.creeps, creep => creep.hits < creep.hitsMax))
        if (creep) {
          tower.heal(creep);
        } else {
          var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
              // consoleStats.log('structure.type = ' + structure.structureType);
              return (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.hits < structure.hitsMax)
                || (structure.structureType == STRUCTURE_WALL && structure.hits < structure.hitsMax * settings.WALL_REPAIR_PER_ONE)
                || (structure.structureType == STRUCTURE_RAMPART && structure.hits < settings.RAMPART_REPAIR_VALUE);
            }
          });
        }

        if (closestDamagedStructure) {
          tower.repair(closestDamagedStructure);
          // consoleStats.log('tower1: repair: ' + closestDamagedStructure.structureType + ' pos: ' + closestDamagedStructure.pos + ' hits: ' + closestDamagedStructure.hits + '/' + closestDamagedStructure.hitsMax);
          // consoleStats.log(closestDamagedStructure.structureType == STRUCTURE_RAMPART + ','+closestDamagedStructure.hits < settings.RAMPART_REPAIR_VALUE)
        }

      }
    }
  }

};
