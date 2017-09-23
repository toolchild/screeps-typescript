// import roleTower from './role/role.tower';
import {creepManager} from './utils/creep-manager';
import {memoryHandler} from './utils/memory-handler';

// const tower1 = Game.getObjectById('587555c0ff22ce385737f1c7');
// const tower2 = Game.getObjectById('58791fds9fcfae81e151c2793');

module.exports.loop = () => {

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
