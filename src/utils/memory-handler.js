/**
 * Created by Bob on 15.01.2017.
 */


export const memoryHandler = {

  memoryNeedsUpdate: false,

  clearMemory() {
    for (let name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        // console.log('clearing non-existing creep memory:', name);
      }
    }
  },

  fillMemory(){
    if (!Memory.home || !Memory.home.roomSources || !Memory.home.room || this.memoryNeedsUpdate) {
      this.Game = Game;
    //   console.log('filling memory');
      Memory.home = {
        room: Game.spawns['Spawn1'].room,
        roomSources: _.map(_.sortBy(Game.spawns['Spawn1'].room.find(FIND_SOURCES), (source) => source.id), (source) => source.id),
      };
    } else {
      Memory.home.room = Game.spawns['Spawn1'].room; // TODO: this holds some values needed to be updated each tick, so it shouldn't be in Memory.
      // console.log('main memory: roomSources: ' + Memory.home.roomSources);
    }

  }
};
