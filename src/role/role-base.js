const taskManager = require('../utils/task-manager');
const settings = require('../settings');
const _ = require('lodash');

const roleBase = {
  sources: null,
  droppedSources: null,

  /** @param creep @type {Creep}
   *  @param droppedSources @type {[Resource]} */
  init(creep, droppedSources){
    this.sources = _.map(creep.memory.home.roomSources, roomSource => Game.getObjectById(roomSource));
    this.droppedSources = droppedSources;
    if (Game.time - creep.memory.hasCollectedFromStorageTick >= 20) {
      creep.memory.hasCollectedFromStorage = false;
    }
  },

  /** @param creep @type {Creep}
   *  @param droppedSources @type {[Resource]} */
  initDistance(creep, droppedSources){
    this.sources = _.sortBy(creep.room.find(FIND_SOURCES), (source) => source.pos.y);
    this.droppedSources = droppedSources;
  },

  /**
   * tasks
   * 0 : need energy
   * 1 : transfer energy
   * 2 : build
   * 3 : upgrade
   * @param creep @type {Creep}
   */
  decideTask(creep){
    creep.memory.task = taskManager.decideTask(creep);
  },

  /**
   * @param creep @type {Creep}
   * @returns  {boolean}
   */
  willGoHome(creep){
    if (creep.room.name != creep.memory.home.room.name) {
      let exit = creep.room.findExitTo(creep.memory.home.room.name);
      creep.moveTo(creep.pos.findClosestByPath(exit));
      return true;
    } else {
      return false;
    }
  },

  /**
   * @param creep @type {Creep}
   * @returns {boolean}
   */
  willGoTargetRoom(creep)  {
    if (creep.room.name != creep.memory.targetRoomName) {
      let exit = creep.room.findExitTo(creep.memory.targetRoomName);
      console.log('base: ' + creep.name + ' go to exit: ' + exit + ' to: ' + creep.memory.targetRoomName);
      let moveError = creep.moveTo(creep.pos.findClosestByPath(exit));
      if (moveError != OK && moveError != ERR_BUSY) {
        this.handleMoveErrorCollect(creep, moveError);
      }
      return true;
    } else {
      return false;
    }
  },

  /**
   * @param creep @type {Creep}
   * @param priorityTargetIndex @type {Number}
   */
  handleHarvest(creep, priorityTargetIndex)
  {
    if (creep.memory.targetIndex == null) {
      creep.memory.targetIndex = priorityTargetIndex == null ? 0 : priorityTargetIndex;
    }
    // console.log('base: target index: ' + creep.memory.targetIndex);
    // console.log('base: this.sources: ' + this.sources);
    let harvestError = creep.harvest(this.sources[creep.memory.targetIndex]);
    if (harvestError != OK) {
      let moveError = creep.moveTo(this.sources[creep.memory.targetIndex]);
      if (moveError != OK) {
        this.handleMoveError(creep, moveError, priorityTargetIndex);
      }
    }
  },

  /**
   * @param creep @type {Creep}
   * @param priorityTargetIndex @type {Number}
   */
  handleDistanceHarvest(creep, priorityTargetIndex)
  {
    if (creep.pos.y < 48) {
      this.handleHarvest(priorityTargetIndex);
    } else {
      creep.move(TOP);
    }
  }
  ,

  /**
   * @param creep @type {Creep}
   */
  handleCollect(creep)  {
    creep.memory.hasCollectedFromStorage = false;
    if (this.droppedSources && this.droppedSources.length > 0) {
      // console.log('base: ' + creep.name + ' droppedSources: ' + this.droppedSources);
      let closest = creep.pos.findClosestByRange(this.droppedSources);
      let gatherError = creep.pickup(closest);
      if (gatherError != OK) {
        let moveError = creep.moveTo(closest);
        if (moveError != OK) {
          this.handleMoveErrorCollect(creep, moveError);
        }
      } else {
        // console.log('base: ' + creep.name + ' gathering');
      }
    } else {
      // var log = 'base: ' + creep.name + ' found no droppedSources to collect';
      let bufferStructures = this.findBufferStructures(creep);
      // console.log(bufferStructures)
      let containers = _.filter(bufferStructures, structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > settings.MIN_PICPUP_ENERGY);
      // console.log('base: ' + creep.name + ' containers: ' + containers);
      // console.log('base: ' + creep.name + ' bufferStructures: ' + bufferStructures);
      let closest;
      if (containers && containers.length > 0) {
        closest = creep.pos.findClosestByRange(containers);
        if (creep.withdraw(closest, RESOURCE_ENERGY) != OK) {
          let moveError = creep.moveTo(closest);
          if (moveError != OK) {
            this.handleMoveErrorCollect(creep, moveError);
          }
        }
      } else {
        let storage = _.filter(bufferStructures, structure => structure.structureType == STRUCTURE_STORAGE && taskManager.storageNeedsEnergy(creep));
        closest = creep.pos.findClosestByRange(storage);
        if (creep.withdraw(closest, RESOURCE_ENERGY) != OK) {
          let moveError = creep.moveTo(closest);
          if (moveError != OK) {
            this.handleMoveErrorCollect(creep, moveError);
          }
        } else {
          // console.log('base: ' + creep.name + ' setCollectedFromStorage to true');
          creep.memory.hasCollectedFromStorage = true;
          creep.memory.hasCollectedFromStorageTick = Game.time;
        }
      }
    }

    if (creep.carry.energy > 0) {
      // log += (' switch to busy');
      creep.memory.isBusy = true;
    }
    // console.log(log);

  },

  /**
   * @param creep @type {Creep}
   */
  handleSweeperCollect(creep)  {
    creep.memory.hasCollectedFromStorage = false;
    if (this.droppedSources && this.droppedSources.length > 0) {
      let gatherError = creep.pickup(this.droppedSources[0]);
      if (gatherError != OK) {
        let moveError = creep.moveTo(this.droppedSources[0]);
        if (moveError != OK) {
          this.handleMoveErrorCollect(creep, moveError);
        }
      } else {
        // console.log('base: ' + creep.name + ' gathering');
      }
    } else {
      // let log = 'base: ' + creep.name + ' found no droppedSources to collect';
      if (creep.carry.energy > 0) {
        // log += (' switch to busy');
        creep.memory.isBusy = true;
      }
      // console.log(log);
    }
  },

  /**
   * @param creep @type {Creep}
   */
  handleTransfer(creep)  {
    let willRepairInstead = false;
    creep.memory.isBusy = true;
    let targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION
          || structure.structureType == STRUCTURE_SPAWN
          || structure.structureType == STRUCTURE_TOWER
          || structure.structureType == STRUCTURE_STORAGE) && (structure.energy < structure.energyCapacity || structure.store < structure.storeCapacity);
      }
    });
    // let storage = Game.getObjectById('5876f85b253a1daf341e47bf');
    // console.log(storage.store[RESOURCE_ENERGY] + '/'+ storage.storeCapacity);
    // console.log(memoryHandler.storageNeedsEnergy(creep));
    // console.log('base ' + creep.name + ' transfer targets ' + targets);
    if (targets.length > 0) {
      willRepairInstead = this.handleTransferTargets(creep, targets);
    } else {
      creep.memory.isBusy = false;
    }
    return willRepairInstead;
  },

  /**
   * @param creep @type {Creep}
   */
  handleBuild(creep)  {
    creep.memory.isBusy = true;
    const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    // console.log('base: ' + creep.name + ' constructionSites: ' + targets);
    if (targets.length > 0) {
      let closest = creep.pos.findClosestByRange(targets);
      // console.log('base: ' + creep.name + ' closest: ' + closest);
      let buildError = creep.build(closest);
      // console.log('base: ' + creep.name + ' build Error: ' + buildError);
      if (buildError == ERR_NOT_IN_RANGE) {
        let moveError = creep.moveTo(closest);
        this.handleMoveError(creep, moveError, null);
      }
    } else {
      creep.memory.isBusy = false;
    }
  },

  /**
   * @param creep @type {Creep}
   */
  handleUpgrade(creep)  {
    creep.memory.isBusy = true;
    if (creep.room.controller) {
      let rangeToController = creep.pos.getRangeTo(creep.room.controller);
      // console.log(rangeToController);
      if (rangeToController <= 2) {
        if (rangeToController === 1 || creep.moveTo(creep.room.controller) == ERR_NO_PATH) {
          creep.upgradeController(creep.room.controller);
        }
      } else {
        creep.moveTo(creep.room.controller);
      }
    } else if (creep.energy === 0) {
      creep.memory.isBusy = false;
      creep.memory.hasCollectedFromStorage = false;
    }
  },

  /**
   * @param creep @type {Creep}
   */
  handleRepair(creep)  {
    creep.memory.isBusy = true;
    let closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => {
        // console.log('structure.type = ' + structure.structureType);
        return (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.hits < structure.hitsMax)
          || (structure.structureType == STRUCTURE_WALL && structure.hits < structure.hitsMax * settings.WALL_REPAIR_PER_ONE)
          || (structure.structureType == STRUCTURE_RAMPART && structure.hits < settings.RAMPART_REPAIR_VALUE);
      }
    });

    // console.log('base: ' + creep.name + " closest Target:" + closestDamagedStructure);
    if (closestDamagedStructure) {
      if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
        creep.moveTo(closestDamagedStructure);
      } else if (creep.carry.energy == 0) {
        creep.memory.hasCollectedFromStorage = false;
      }
    } else {

      creep.memory.isBusy = false;
    }
  },

  /**
   * @param creep @type {Creep}
   * @param moveError {Number}
   * @param priorityTargetIndex {Number}
   */
  handleMoveError(creep, moveError, priorityTargetIndex)  {
    switch (moveError) {
      case -11: { // tired
        // console.log('base: ' + creep.name + ' is tired.');
        break;
      }
      case -4: { // spawning
        // console.log('base: ' + creep.name + ' is spawning.');
        break;
      }
      case -7: {
        console.log('base: ' + creep.name + ' invalid target');
        break;
      }
      default : {
        console.log('base: ' + creep.name + ' moveError: ' + moveError);
        // console.log('base: ' + creep.name + ' targetIndex: ' + creep.memory.targetIndex + ' prioTargetIndex is null: ' + (prioTargetIndex == null));
        creep.memory.targetIndex = priorityTargetIndex == null ? creep.memory.targetIndex + 1 : creep.memory.targetIndex - 1;
        if (creep.memory.targetIndex > this.sources.length || creep.memory.targetIndex < 0) {
          creep.memory.targetIndex = null;
          // console.log('base: ' + creep.name + ' targetIndex reset');

        } else {
          // console.log('base: ' + creep.name + ' targetIndex changed: ' + creep.memory.targetIndex + ' source: ' + this.sources[creep.memory.targetIndex]);
        }
      }
    }
  },

  /**
   * @param creep @type {Creep}
   * @param moveError {Number}
   */
  handleMoveErrorCollect(creep, moveError){
    switch (moveError) {
      case -11: { // tired
        // console.log('base: ' + creep.name + ' is tired.');
        break;
      }
      case -4: { // spawning
        // console.log('base: ' + creep.name + ' is spawning.');
        break;
      }
      case -7: {
        // handled by caller TODO: this should return a piece of a log message?
        break;
      }
      default : {
        // console.log('base: ' + creep.name + ' moveError: ' + moveError);
        if (creep.memory.targetIndex > this.droppedSources.length) {
          creep.memory.targetIndex = null;
          // console.log('base: ' + creep.name + ' targetIndex reset');

        } else {
          // console.log('base: ' + creep.name + ' targetIndex changed: ' + this.droppedSources[creep.memory.targetIndex]);
        }
      }
    }
  },

  /**
   * @param creep @type {Creep}
   * @param targets {[]}
   */
  handleTransferTargets(creep, targets){
    let willRepairInstead = false;
    let prioStructures = _.filter(targets, (target) => target.structureType == STRUCTURE_EXTENSION || target.structureType == STRUCTURE_SPAWN);
    let closestTarget = null;
    if (prioStructures.length > 0) {
      closestTarget = this.transferMoveToClosestTarget(creep, prioStructures);
    } else {
      closestTarget = this.findClosestTowerThatNeedsEnergyByRange(creep, targets);
      // console.log('base: ' + creep.name + ' closestTower: ' + closestTarget + ' !closestTower ' + !closestTarget);
      if (closestTarget) {
        if (creep.transfer(closestTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(closestTarget);
        }
      } else if (!creep.memory.hasCollectedFromStorage) {
        targets.push(creep.room.storage);
        closestTarget = this.findClosestStorageThatNeedsEnergy(creep, targets);
        if (creep.transfer(closestTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(closestTarget);
        }
      }

      if (!closestTarget) {
        // console.log('base: ' + creep.name + ' collected from storage and will repair instead');
        willRepairInstead = true;
        this.handleRepair(creep);
      }
    }

    return willRepairInstead;
  },

  /**
   * @param creep @type {Creep}
   */
  findBufferStructures(creep){
    return creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_CONTAINER) && (structure.energy > 0 || structure.store[RESOURCE_ENERGY] > 0);
      }
    });
  },

  /**
   * @param creep @type {Creep}
   * @param priorityStructures {[]}
   */
  transferMoveToClosestTarget(creep, priorityStructures){
    let closestTarget = creep.pos.findClosestByRange(priorityStructures);
    if (creep.transfer(closestTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(closestTarget);
    }
    return closestTarget;
  },

  /**
   * @param creep @type {Creep}
   * @param targets{[]}
   */
  findClosestTowerThatNeedsEnergyByRange(creep, targets){
    return creep.pos.findClosestByRange(targets, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_TOWER && taskManager.towerNeedsEnergy(creep));
      }
    });
  },

  /**
   * @param creep @type {Creep}
   * @param targets{[]}
   */
  findClosestStorageThatNeedsEnergy(creep, targets){
    return creep.pos.findClosestByRange(targets, {
      filter: function (target) {
        return (target.structureType == STRUCTURE_STORAGE && taskManager.storageNeedsEnergy(creep));
      }
    });
  }
};

module.exports = roleBase;
