import { roleBase }from './role-base';

export const roleSweeper = {
  creep: null,
  droppedSources: null,

  run: function (creep) {
    this.init(creep);
    roleBase.decideTask(this.creep);
    this.handleTask();
  },

  init(creep){
    this.creep = creep;
    this.droppedSources = this.creep.room.find(FIND_DROPPED_RESOURCES,
      {
        filter: dropped => {
          // consoleStats.log('coll: '+this.creep.name +' '+dropped.energy + '/' + this.creep.carryCapacity);
          // consoleStats.log('coll: '+this.creep.name +' ' +(dropped.energy > this.creep.carryCapacity));
          return (dropped.energy > this.creep.carryCapacity && !_.contains(_.map(dropped.pos.look(), object => object.type), 'creep')) || dropped.energy > 250;
        }
      });
    roleBase.init(this.creep, this.droppedSources);

  },

  handleTask() {
    let willRepairInstead = false;
    if (!roleBase.willGoHome(this.creep)) {
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
          roleBase.handleTransfer(this.creep);
          this.creep.say('t');
          break;
        }

        case 3: {
          roleBase.handleTransfer(this.creep);
          this.creep.say('t');
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
