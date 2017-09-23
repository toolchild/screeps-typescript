import roleBase from './role-base';

export default roleCollector = {
  creep: null,
  droppedSources: null,

  run(creep) {
    this.init(creep);
    roleBase.decideTask(creep);
    this.handleTask();
  },

  init(creep){
    this.creep = creep;
    this.droppedSources = this.creep.room.find(FIND_DROPPED_RESOURCES,
      {
        filter: dropped => {
          // consoleStats.log('coll: '+this.creep.name +' '+dropped.energy + '/' + this.creep.carryCapacity);
          // consoleStats.log('coll: '+this.creep.name +' ' +(dropped.energy > this.creep.carryCapacity));
          return dropped.energy > this.creep.carryCapacity / 2;
        }
      });
    roleBase.init(this.creep, this.droppedSources);

  },

  handleTask() {
    if (!roleBase.willGoHome(this.creep)) {
      let willRepairInstead = false;
      switch (this.creep.memory.task) {
        case 0: {
          roleBase.handleCollect(this.creep);
          this.creep.say('c');
          break;
        }
        case 1: {
          willRepairInstead = roleBase.handleTransfer(this.creep);
          // console.log('coll: ' + this.creep.name + ' willRepairInstead: '  + willRepairInstead);
          if (willRepairInstead) {
            this.creep.say('r');
          } else {
            this.creep.say('t');
          }
          break;
        }
        case 2: {
          roleBase.handleBuild(this.creep);
          this.creep.say('b');
          break;
        }
        case 3: {
          roleBase.handleRepair(this.creep);
          this.creep.say('r');

          break;
        }

        default: {
          this.creep.memory.task = 0;
          this.creep.say('reset');
          break;
        }
      }
    }
  },

};

