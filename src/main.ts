import { roleTower } from './role/role.tower';
import { creepManager } from './utils/creep-manager';
import { memoryHandler } from './utils/memory-handler';

module.exports.loop = () => {
  const towers: StructureTower[] = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
    filter: { structureType: STRUCTURE_TOWER }
  });

  //   try {
  memoryHandler.clearMemory();
  memoryHandler.fillMemory();
  creepManager.prepareCreepsAmounts();
  creepManager.logStats();
  creepManager.respawnCreeps();
  _.forEach(towers, (tower) => {
    roleTower.run(tower);
  });
  creepManager.handleCreeps();
  //   printStatsConsole(creepManager.getCreepStats());
  //   } catch (error) {console.log(error)}

};
