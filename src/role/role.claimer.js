

var roleClaimer = {
  /** @param {Creep} creep **/
    run(creep) {
    // consoleStats.log('claim: ' + creep.name + ' home ' + creep.home + ' targetRoomName: ' + creep.memory.targetRoomName + ' home: ' + creep.memory.home.home.name);

        if (creep.room.name === creep.memory.home.room.name) {
            this.exitRoom(creep);
        } else if (creep.room.controller) {
            // consoleStats.log('claim: ' + creep.name + ' is in targetRoom and found Controller');
            let claimError = creep.claimController(creep.room.controller);
            switch (claimError) {
                case ERR_NOT_IN_RANGE: {
                    if (creep.moveTo(creep.room.controller) != 0) {
                        // we didn't find a path or cannot move their:
                        if (creep.pos.y > 47) {
                            // move north 2 steps if entered south
                            creep.move(TOP);
                        }

                    }
                    break;
                }
                case ERR_GCL_NOT_ENOUGH: {
                    // consoleStats.log('claim: ' + creep.name + ' cannot claim because the GCL is too low.');
                    let reserveError = creep.reserveController(creep.room.controller);

                    if (reserveError == ERR_NOT_IN_RANGE) {
                        console.log('claim: ' + creep.name + ' cannot reserve because ' + reserveError);
                        if (creep.moveTo(creep.room.controller) != 0) {
                            // we didn't find a path or cannot move their:
                            if (creep.pos.y > 47) {
                                // move north 2 steps if entered south
                                creep.move(TOP);
                            }

                        }
                    }

                    break;
                }
                default: {
                    console.log('claim: ' + creep.name + ' done with message: ' + claimError);
                    break;
                }
            }
        }
    },

    exitRoom(creep){
        let exit = creep.room.findExitTo(creep.memory.targetRoomName);
        console.log('claim: exit: ' + exit);
        creep.moveTo(creep.pos.findClosestByPath(exit));
    },
};


module.exports = roleClaimer;

