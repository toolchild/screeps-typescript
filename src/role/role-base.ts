import * as _ from 'lodash';

import { settings } from '../settings';
import { taskManager } from '../utils/task-manager';

export const roleBase = {
  droppedSources: null as Resource[] | null,
  sources: null as Source[] | null,

  init(creep: Creep, droppedSources: Resource[]) {
    this.sources = _.map(creep.memory.home.roomSources,
      (roomSource: string) => Game.getObjectById(roomSource)) as Source[] | null;
    this.droppedSources = droppedSources;
    if (Game.time - creep.memory.hasCollectedFromStorageTick >= 20) {
      creep.memory.hasCollectedFromStorage = false;
    }
  },

  /** @param creep @type {Creep}
   *  @param droppedSources @type {[Resource]}
   */
  initDistance(creep: Creep, droppedSources: Resource[]) {
    this.sources = _.sortBy(creep.room.find(FIND_SOURCES), (source: Resource) => source.pos.y);
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
  decideTask(creep: Creep) {
    creep.memory.task = taskManager.decideTask(creep);
  },

  /**
   * @param creep @type {Creep}
   * @returns  {boolean}
   */
  willGoHome(creep: Creep) {
    if (creep.room.name !== creep.memory.home.room.name) {
      const exit = creep.room.findExitTo(creep.memory.home.room.name);
      creep.moveTo(creep.pos.findClosestByPath(exit));
      return true;
    }
    return false;
  },

  /**
   * @param creep @type {Creep}
   * @returns {boolean}
   */
  willGoTargetRoom(creep: Creep) {
    if (creep.room.name !== creep.memory.targetRoomName) {
      const exit = creep.room.findExitTo(creep.memory.targetRoomName);
      console.log('base: ' + creep.name + ' go to exit: ' + exit + ' to: ' + creep.memory.targetRoomName);
      const moveError = creep.moveTo(creep.pos.findClosestByPath(exit));
      if (moveError !== OK && moveError !== ERR_BUSY) {
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
  handleHarvest(creep: Creep, priorityTargetIndex: number) {
    if (creep.memory.targetIndex == null) {
      creep.memory.targetIndex = priorityTargetIndex == null ? 0 : priorityTargetIndex;
    }
    // console.log('base: target index: ' + creep.memory.targetIndex);
    // console.log('base: this.sources: ' + this.sources);
    if (this.sources) {
      const harvestError = creep.harvest(this.sources[creep.memory.targetIndex]);
      if (harvestError !== OK) {
        const moveError = creep.moveTo(this.sources[creep.memory.targetIndex]);
        if (moveError !== OK) {
          this.handleMoveError(creep, moveError, priorityTargetIndex);
        }
      }
    }
  },

  /**
   * @param creep @type {Creep}
   * @param priorityTargetIndex @type {Number}
   */
  handleDistanceHarvest(creep: Creep, priorityTargetIndex: number) {
    if (creep.pos.y < 48) {
      this.handleHarvest(creep, priorityTargetIndex);
    } else {
      creep.move(TOP);
    }
  }
  ,

  handleCollect(creep: Creep) {

    creep.memory.hasCollectedFromStorage = false;
    if (this.droppedSources && this.droppedSources.length > 0) {
      // console.log('base: ' + creep.name + ' droppedSources: ' + this.droppedSources);
      const closest = creep.pos.findClosestByRange(this.droppedSources);
      const gatherError = creep.pickup(closest);
      if (gatherError !== OK) {
        const moveError = creep.moveTo(closest);
        if (moveError !== OK) {
          this.handleMoveErrorCollect(creep, moveError);
        }
      } else {
        // console.log('base: ' + creep.name + ' gathering');
      }
    } else {
      // var log = 'base: ' + creep.name + ' found no droppedSources to collect';
      const bufferStructures: Structure[] = this.findBufferStructures(creep);
      // console.log(bufferStructures)
      const containers = _.filter(bufferStructures,
        (structure: any) => structure.structureType === STRUCTURE_CONTAINER
          && structure.store[RESOURCE_ENERGY] > settings.MIN_PICPUP_ENERGY);
      // console.log('base: ' + creep.name + ' containers: ' + containers);
      // console.log('base: ' + creep.name + ' bufferStructures: ' + bufferStructures);
      let closest: Structure;
      if (containers && containers.length > 0) {
        closest = creep.pos.findClosestByRange(containers);
        if (creep.withdraw(closest, RESOURCE_ENERGY) !== OK) {
          const moveError = creep.moveTo(closest);
          if (moveError !== OK) {
            this.handleMoveErrorCollect(creep, moveError);
          }
        }
      } else {
        const storage: Structure[] = _.filter(bufferStructures,
          (structure: Structure) => structure.structureType === STRUCTURE_STORAGE && taskManager.storageNeedsEnergy(creep));
        closest = creep.pos.findClosestByRange(storage);
        if (creep.withdraw(closest, RESOURCE_ENERGY) !== OK) {
          const moveError = creep.moveTo(closest);
          if (moveError !== OK) {
            this.handleMoveErrorCollect(creep, moveError);
          }
        } else {
          // console.log('base: ' + creep.name + ' setCollectedFromStorage to true');
          creep.memory.hasCollectedFromStorage = true;
          creep.memory.hasCollectedFromStorageTick = Game.time;
        }
      }
    }

    if (creep.carry.energy !== undefined && creep.carry.energy > 0) {
      // log += (' switch to busy');
      creep.memory.isBusy = true;
    }
    // console.log(log);

  },

  /**
   * @param creep @type {Creep}
   */
  handleTransfer(creep: Creep) {
    let willRepairInstead = false;
    creep.memory.isBusy = true;
    const targets: Structure[] = creep.room.find(FIND_STRUCTURES, {
      filter: (structure: any) => {
        return (structure.structureType === STRUCTURE_EXTENSION
          || structure.structureType === STRUCTURE_SPAWN
          || structure.structureType === STRUCTURE_TOWER
          || structure.structureType === STRUCTURE_STORAGE)
          && (structure.energy < structure.energyCapacity || structure.store < structure.storeCapacity);
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
  handleBuild(creep: Creep) {
    creep.memory.isBusy = true;
    const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    // console.log('base: ' + creep.name + ' constructionSites: ' + targets);
    if (targets.length > 0) {
      const closest: any = creep.pos.findClosestByRange(targets);
      // console.log('base: ' + creep.name + ' closest: ' + closest);
      const buildError = creep.build(closest);
      // console.log('base: ' + creep.name + ' build Error: ' + buildError);
      if (buildError === ERR_NOT_IN_RANGE) {
        const moveError = creep.moveTo(closest);
        this.handleMoveError(creep, moveError, null);
      }
    } else {
      creep.memory.isBusy = false;
    }
  },

  handleUpgrade(creep: Creep) {
    creep.memory.isBusy = true;
    if (creep.room.controller) {
      const rangeToController = creep.pos.getRangeTo(creep.room.controller);
      // console.log(rangeToController);
      if (rangeToController <= 2) {
        if (rangeToController === 1 || creep.moveTo(creep.room.controller) === ERR_NO_PATH) {
          creep.upgradeController(creep.room.controller);
        }
      } else {
        creep.moveTo(creep.room.controller);
      }
    } else if (creep.carry.energy === 0) {
      creep.memory.isBusy = false;
      creep.memory.hasCollectedFromStorage = false;
    }
  },

  /**
   * @param creep @type {Creep}
   */
  handleRepair(creep: Creep) {
    creep.memory.isBusy = true;
    const closestDamagedStructure: any = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure: any) => {
        // console.log('structure.type = ' + structure.structureType);
        return (
          structure.structureType !== STRUCTURE_WALL && structure.structureType !== STRUCTURE_RAMPART && structure.hits < structure.hitsMax)
          || (structure.structureType === STRUCTURE_WALL && structure.hits < structure.hitsMax * settings.WALL_REPAIR_PER_ONE)
          || (structure.structureType === STRUCTURE_RAMPART && structure.hits < settings.RAMPART_REPAIR_VALUE);
      }
    });

    // console.log('base: ' + creep.name + " closest Target:" + closestDamagedStructure);
    if (closestDamagedStructure) {
      if (creep.repair(closestDamagedStructure) === ERR_NOT_IN_RANGE) {
        creep.moveTo(closestDamagedStructure);
      } else if (creep.carry.energy === 0) {
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
  handleMoveError(creep: Creep, moveError: any, priorityTargetIndex: any) {
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
      default: {
        console.log('base: ' + creep.name + ' moveError: ' + moveError);
        // console.log('base: ' + creep.name + ' targetIndex: ' + creep.memory.targetIndex + ' prioTargetIndex is null: ' + (prioTargetIndex == null));
        creep.memory.targetIndex = priorityTargetIndex == null ? creep.memory.targetIndex + 1 : creep.memory.targetIndex - 1;
        if (this.sources && (creep.memory.targetIndex > this.sources.length || creep.memory.targetIndex < 0)) {
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
  handleMoveErrorCollect(creep: Creep, moveError: any) {
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
      default: {
        // console.log('base: ' + creep.name + ' moveError: ' + moveError);
        if (this.droppedSources && creep.memory.targetIndex > this.droppedSources.length) {
          creep.memory.targetIndex = null;
          // console.log('base: ' + creep.name + ' targetIndex reset');

        } else {
          // console.log('base: ' + creep.name + ' targetIndex changed: ' + this.droppedSources[creep.memory.targetIndex]);
        }
      }
    }
  },

  handleTransferTargets(creep: Creep, targets: Structure[]) {
    let willRepairInstead: boolean = false;
    const prioStructures = _.filter(targets, (target: Structure) => target.structureType === STRUCTURE_EXTENSION || target.structureType === STRUCTURE_SPAWN);
    let closestTarget: Structure;
    if (prioStructures.length > 0) {
      closestTarget = this.transferMoveToClosestTarget(creep, prioStructures);
    } else {
      closestTarget = this.findClosestTowerThatNeedsEnergyByRange(creep, targets);
      // console.log('base: ' + creep.name + ' closestTower: ' + closestTarget + ' !closestTower ' + !closestTarget);
      if (closestTarget) {
        if (creep.transfer(closestTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(closestTarget);
        }
      } else if (!creep.memory.hasCollectedFromStorage && creep.room.storage) {
        targets.push(creep.room.storage);
        closestTarget = this.findClosestStorageThatNeedsEnergy(creep, targets);
        if (creep.transfer(closestTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
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

  findBufferStructures(creep: Creep) {
    return creep.room.find(FIND_STRUCTURES, {
      filter: (structure: any) => {
        return (structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_CONTAINER) && (structure.energy > 0 || structure.store[RESOURCE_ENERGY] > 0);
      }
    }) as Structure[];
  },

  transferMoveToClosestTarget(creep: Creep, priorityStructures: Structure[]) {
    const closestTarget: Structure = creep.pos.findClosestByRange(priorityStructures);
    if (creep.transfer(closestTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(closestTarget);
    }
    return closestTarget;
  },

  findClosestTowerThatNeedsEnergyByRange(creep: Creep, targets: Structure[]) {
    return creep.pos.findClosestByRange(targets, {
      filter: (structure: Structure) => {
        return (structure.structureType === STRUCTURE_TOWER && taskManager.towerNeedsEnergy(creep));
      }
    });
  },

  findClosestStorageThatNeedsEnergy(creep: Creep, targets: Structure[]) {
    return creep.pos.findClosestByRange(targets, {
      filter(target: Structure) {
        return (target.structureType === STRUCTURE_STORAGE && taskManager.storageNeedsEnergy(creep));
      }
    });
  }
};
