const roleTower = require('./role/role.tower');
const memoryHandler = require("./utils/memory-handler");
const creepManager = require("./utils/creep-manager");

// const tower1 = Game.getObjectById('587555c0ff22ce385737f1c7');
// const tower2 = Game.getObjectById('58791fds9fcfae81e151c2793');

module.exports.loop = function () {

//   try {
  memoryHandler.clearMemory();
  memoryHandler.fillMemory();
  creepManager.prepareCreepsAmounts();
  creepManager.logStats();
  creepManager.respawnCreeps();
//   roleTower.run(tower1);
//   roleTower.run(tower2);
  creepManager.handleCreeps();
//   printStatsConsole(creepManager.getCreepStats());
//   } catch (error) {console.log(error)}

};
