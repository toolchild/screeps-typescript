export const taskManager = {

  /** @param {Creep} creep
   tasks
   0 : need energy,
   1 : transfer energy,
   2 : build,
   3 : upgrade*/
  decideTask(creep) {

    let constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
    // consoleStats.log('task: ' + creep.name + 'cSites: ' + constructionSites);
    // consoleStats.log('task: ' + creep.name + ' store: ' + creep.room.storage.store[RESOURCE_ENERGY] + '/'+ creep.room.storage.storeCapacity*0.01 + ' needs Energy: ' + this.storageNeedsEnergy(creep))
    let room = creep.room;
    if (creep.carry.energy === 0) {
      creep.memory.isBusy = false;
    }
    if (creep.carry.energy < creep.carryCapacity && !creep.memory.isBusy) {
      return 0;
    } else if ((room.energyAvailable < room.energyCapacityAvailable
      || this.towerNeedsEnergy(creep)
      || (this.storageNeedsEnergy(creep) && constructionSites.length == 0))
    ) {
      return 1;
    } else if (constructionSites.length > 0) {
      return 2;
    } else {
      return 3;
    }
  },

  towerNeedsEnergy(creep) {
    return creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity * 0.6;
      }
    }).length > 0;
  },

  storageNeedsEnergy(creep) {
    return creep.room.storage ? creep.room.storage.store[RESOURCE_ENERGY] < creep.room.storage.storeCapacity * 0.50 : false;
  }

};


