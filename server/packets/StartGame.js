const msgpack = require("msgpack-lite");

function StartGame(timer) {
    this.timer = timer;
}

module.exports = StartGame;

StartGame.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 2,
        data: {
            timer: this.timer
        }
    });

    return buf;
};
