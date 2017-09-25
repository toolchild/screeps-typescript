import { roleCollector } from "../role/role.collector";
const { roleMiner } = require('../role/role.miner');
const { roleUpgrader } = require('../role/role.upgrader');
const { roleClaimer } = require('../role/role.claimer');
const { roleHarvester } = require("../role/role.harvester");
const { roleSweeper } = require("../role/role.sweeper");
const { roleDistanceHarvester } = require('../role/role.distance-harvester');
const { roleRepairer } = require('../role/role.repairer');
const { settings } = require('settings');
const { constants } = require('../constants');
const _ = require('lodash');

const roomCapacity = Memory.home == null ? Game.spawns['Spawn1'].room.energyCapacityAvailable : Memory.home.room.energyCapacityAvailable;

export const creepManager = {

  targetRoom: '',

  numS100: settings.NUM_S100,
  numR200: settings.NUM_R200,
  numH200: settings.NUM_H200,

  log: () => console.log(roomCapacity)(),

  numH300: roomCapacity >= constants.E_LEVEL_300 && roomCapacity < constants.E_LEVEL_550 ? settings.NUM_H300 : 0,
  numH550: roomCapacity >= constants.E_LEVEL_550 && roomCapacity < constants.E_LEVEL_800 ? settings.NUM_H550 : 0,
  numH800: roomCapacity >= constants.E_LEVEL_800 ? settings.NUM_H800 : 0,

  numM0250: (roomCapacity >= constants.E_LEVEL_250 && roomCapacity < constants.E_LEVEL_550)
    || Game.spawns['Spawn1'].room.energyAvailable < constants.E_LEVEL_550 && _.filter(Game.creeps, (creep) => creep.memory.role.startsWith('m')) < 1 ? settings.NUM_M0250 : 0,
  numM1250: roomCapacity >= constants.E_LEVEL_250 && roomCapacity < constants.E_LEVEL_550 ? settings.NUM_M1250 : 0,
  numM0550: roomCapacity >= constants.E_LEVEL_550 ? settings.NUM_M0550 : 0,
  numM1550: roomCapacity >= constants.E_LEVEL_550 ? settings.NUM_M1550 : 0,

  numC250: (roomCapacity >= constants.E_LEVEL_250 && roomCapacity < constants.E_LEVEL_550)
    || Game.spawns['Spawn1'].room.energyAvailable < constants.E_LEVEL_550 && _.filter(Game.creeps, (creep) => creep.memory.role.startsWith('c')) < 1 ? settings.NUM_Col250 : 0,
  numC550: roomCapacity >= constants.E_LEVEL_550 && roomCapacity < constants.E_LEVEL_750 ? settings.NUM_Col550 : 0,
  numC750: roomCapacity >= constants.E_LEVEL_750 && roomCapacity < constants.E_LEVEL_1300 ? settings.NUM_Col750 : 0,
  numC1300: roomCapacity >= constants.E_LEVEL_1300 ? settings.NUM_Col1300 : 0,

  numUp200: roomCapacity >= constants.E_LEVEL_200 && roomCapacity < constants.E_LEVEL_550 ? settings.NUM_Up200 : 0,
  numUp550: roomCapacity >= constants.E_LEVEL_550 && roomCapacity < constants.E_LEVEL_750 ? settings.NUM_Up550 : 0,
  numUp750: roomCapacity >= constants.E_LEVEL_750 && roomCapacity < constants.E_LEVEL_1550 ? settings.NUM_Up750 : 0,
  numUp1550: roomCapacity >= constants.E_LEVEL_1550 ? settings.NUM_Up1550 : 0,

  numDH800: settings.NUM_DH800,
  numCl100: settings.NUM_Cl100,

  s100: null, r200: null,

  h200: null, h300: null, h550: null, h800: null,

  m0250: null, m1250: null, m0550: null, m1550: null,

  c250: null, c550: null, c750: null, c1300: null,

  dH800: null, cl100: null,

  up200: null, up550: null, up750: null, up1550: null,

  prepareCreepsAmounts() {
    this.s100 = _.filter(Game.creeps, (creep) => creep.name.startsWith('s100'));
    this.r200 = _.filter(Game.creeps, (creep) => creep.memory.role === 'r200');
    this.h200 = _.filter(Game.creeps, (creep) => creep.memory.role === 'h200');
    this.h300 = _.filter(Game.creeps, (creep) => creep.memory.role == 'h300');
    this.h550 = _.filter(Game.creeps, (creep) => creep.memory.role == 'h550');
    this.h800 = _.filter(Game.creeps, (creep) => creep.memory.role == 'h800');
    this.m0250 = _.filter(Game.creeps, (creep) => creep.memory.role == 'm0250');
    this.m1250 = _.filter(Game.creeps, (creep) => creep.memory.role == 'm1250');
    this.m0550 = _.filter(Game.creeps, (creep) => creep.memory.role == 'm0550');
    this.m1550 = _.filter(Game.creeps, (creep) => creep.memory.role == 'm1550');
    this.c250 = _.filter(Game.creeps, (creep) => creep.memory.role == 'c250');
    this.c550 = _.filter(Game.creeps, (creep) => creep.memory.role == 'c550');
    this.c750 = _.filter(Game.creeps, (creep) => creep.memory.role == 'c750');
    this.c1300 = _.filter(Game.creeps, (creep) => creep.memory.role == 'c1300');

    this.up200 = _.filter(Game.creeps, (creep) => creep.memory.role == 'up200');
    this.up550 = _.filter(Game.creeps, (creep) => creep.memory.role == 'up550');
    this.up750 = _.filter(Game.creeps, (creep) => creep.memory.role == 'up750');
    this.up1550 = _.filter(Game.creeps, (creep) => creep.memory.role == 'up1550');

    this.cl100 = _.filter(Game.creeps, (creep) => creep.memory.role == 'cl100');
    this.dH800 = _.filter(Game.creeps, (creep) => creep.memory.role === 'dH800');
  },
  logStats() {
    console.log('main:Energy:' + Memory.home.room.energyAvailable + '/' + roomCapacity
      + ' s100:' + this.s100.length + '/' + this.numS100
      + ' r200:' + this.h200.length + '/' + this.numR200
      + ' h200:' + this.h200.length + '/' + this.numH200
      + ' h300:' + this.h300.length + '/' + this.numH300
      + ' h550:' + this.h550.length + '/' + this.numH550
      + ' h800:' + this.h800.length + '/' + this.numH800

      + ' m0250:' + this.m0250.length + '/' + this.numM0250
      + ' m1250:' + this.m1250.length + '/' + this.numM1250
      + ' m0550:' + this.m0550.length + '/' + this.numM0550
      + ' m1550:' + this.m1550.length + '/' + this.numM1550

      + ' c250:' + this.c250.length + '/' + this.numC250
      + ' c550:' + this.c550.length + '/' + this.numC550
      + ' c750:' + this.c750.length + '/' + this.numC750
      + ' c1300:' + this.c1300.length + '/' + this.numC1300

      + ' u200:' + this.up200.length + '/' + this.numUp200
      + ' u550:' + this.up550.length + '/' + this.numUp550
      + ' u750:' + this.up750.length + '/' + this.numUp750
      + ' u1550:' + this.up1550.length + '/' + this.numUp1550

      + ' cl100:' + this.cl100.length + '/' + this.numCl100
      + ' dH800:' + this.dH800.length + '/' + this.numDH800
    );
    if (Game.spawns['Spawn1'].spawning) {
      console.log('base: spawning: ' + Game.spawns['Spawn1'].spawning.name);
    }
  },

  respawnCreeps() {
    let spawnError = 0;

    // ----- sweeper -----
    if (spawnError.length == null && this.s100.length < this.numS100) {
      let role = 's100';
      spawnError = this.spawnCreep([CARRY, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }

    // ----- sweeper -----
    if (spawnError.length == null && this.r200.length < this.numR200) {
      let role = 'r200';
      spawnError = this.spawnCreep([WORK, CARRY, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }
    // ----- harvesters -----
    spawnError = this.spawnHarvester(spawnError);

    // ----- miner -----
    spawnError = this.spawnMiner(spawnError);

    // ----- collectors -----
    spawnError = this.spawnCollectors(spawnError);

    // ----- looter -----
    if (spawnError.length == null && this.dH800.length < this.numDH800) {
      let role = 'dH800';
      spawnError = this.spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }
    // ----- claimer -----
    if (spawnError.length == null && this.cl100.length < this.numCl100) {
      let role = 'cl100';
      spawnError = this.spawnCreep([CLAIM, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }
    // ---- upgrader -----
    spawnError = this.spawnUpgraders(spawnError);

  },

  spawnHarvester(spawnError) {
    if (spawnError.length == null && this.h200.length < this.numH200) {
      let role = 'h200';
      spawnError = this.spawnCreep([WORK, CARRY, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);

    }
    if (spawnError.length == null && this.h300.length < this.numH300) {
      let role = 'h300';
      spawnError = this.spawnCreep([WORK, WORK, CARRY, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);

    }
    if (spawnError.length == null && this.h550.length < this.numH550) {
      let role = 'h550';
      spawnError = this.spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);

    }
    if (spawnError.length == null && this.h800.length < this.numH800) {
      let role = 'h800';
      spawnError = this.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);

    }
    return spawnError;
  },

  spawnMiner(spawnError) {
    if (spawnError.length == null && this.m0250.length < this.numM0250) {
      let role = 'm0250';
      spawnError = this.spawnCreep([WORK, WORK, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }
    if (spawnError.length == null && this.m1250.length < this.numM1250) {
      let role = 'm1250';
      spawnError = this.spawnCreep([WORK, WORK, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }
    if (spawnError.length == null && this.m0550.length < this.numM0550) {
      let role = 'm0550';
      spawnError = this.spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }
    if (spawnError.length == null && this.m1550.length < this.numM1550) {
      let role = 'm1550';
      spawnError = this.spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }

    return spawnError;
  },

  spawnCollectors(spawnError) {
    if (spawnError.length == null && this.c250.length < this.numC250) {
      let role = 'c250';
      spawnError = this.spawnCreep([WORK, CARRY, MOVE, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }

    if (spawnError.length == null && this.c550.length < this.numC550) {
      let role = 'c550';
      spawnError = this.spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }
    if (spawnError.length == null && this.c750.length < this.numC750) {
      let role = 'c750';
      spawnError = this.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }

    if (spawnError.length == null && this.c1300.length < this.numC1300) {
      let role = 'c1300';
      spawnError = this.spawnCreep([WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }
    return spawnError;

  },

  spawnUpgraders(spawnError) {
    if (spawnError.length == null && this.up200.length < this.numUp200) {
      let role = 'up200';
      spawnError = this.spawnCreep([WORK, CARRY, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);

    }
    if (spawnError.length == null && this.up550.length < this.numUp550) {
      let role = 'up550';
      spawnError = this.spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);

    }
    if (spawnError.length == null && this.up750.length < this.numUp750) {
      let role = 'up750';
      spawnError = this.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }
    if (spawnError.length == null && this.up1550.length < this.numUp1550) {
      let role = 'up1550';
      spawnError = this.spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], role, role, this.targetRoom);
      this.handleSpawnError(spawnError, role);
    }
    return spawnError;
  },

  spawnCreep(body, role, name, targetRoomName) {
    return Game.spawns['Spawn1'].createCreep(body, name + '-' + Math.floor(Math.random() * 100), {
      auto: true,
      role: role,
      targetRoomName: targetRoomName,
      home: Memory.home
    });
  },

  handleCreeps() {
    for (let name in Game.creeps) {
      let creep = Game.creeps[name];
      if (creep.memory.auto) {

        if (creep.memory.role == 'up200' || creep.memory.role == 'up550' || creep.memory.role == 'up750' || creep.memory.role == 'up1550') {
          roleUpgrader.run(creep);
        } else if (creep.memory.role == 'r200') {
          roleRepairer.run(creep);
        } else if (creep.memory.role == 'h200' || creep.memory.role == 'h300' || creep.memory.role == 'h550' || creep.memory.role == 'h800') {
          roleHarvester.run(creep);
        } else if (creep.memory.role == 's100') {
          roleSweeper.run(creep);
        } else if (creep.memory.role == 'claimer') {
          roleClaimer.run(creep);
        } else if (creep.memory.role == 'dH800') {
          roleDistanceHarvester.run(creep);
        } else if (creep.memory.role == 'c250' || creep.memory.role == 'c550' || creep.memory.role == 'c750' || creep.memory.role == 'c1300') {
          roleCollector.run(creep);
        } else if (creep.memory.role == 'm0250' || creep.memory.role == 'm1250') {
          roleMiner.run(creep);
        } else if (creep.memory.role == 'm0550' || creep.memory.role == 'm1550') {
          roleMiner.run(creep);
        }
      }
    }
  },

  handleSpawnError(spawnError, role) {
    if (role && spawnError && !spawnError.name) {
      switch (spawnError) {
        case ERR_BUSY: {
          console.log('spawn: ' + role + ' cannot spawn because spawn is busy')
          break;
        }
        case ERR_NOT_ENOUGH_ENERGY: {
          console.log('spawn: ' + role + ' waiting for energy to spawn');
          break;
        }
        default: {
          console.log('spawn: new: ' + role + ' spanwnError: ' + spawnError);
          break;
        }
      }
    }
  },
  getCreepStats() {
    // sample data format ["Name for Stat", variableForStat]
    let spacer = '                                            max: ';
    return [

      ["m0550" + spacer + this.numM0550, this.m0550.length],
      ["m1550" + spacer + this.numM1550, this.m1550.length],
      ["c1300" + spacer + this.numC1300, this.c1300.length]
      // ["Towers", towersCPUUsage],
      // ["Links", linksCPUUsage],
      // ["Setup Roles", SetupRolesCPUUsage],
      // ["Creeps", CreepsCPUUsage],
      // ["Init", initCPUUsage],
      // ["Stats", statsCPUUsage],
      // ["Total", totalCPUUsage]
    ];
  },

};
