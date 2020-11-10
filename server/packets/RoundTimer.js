const msgpack = require("msgpack-lite");

function RoundTimer(time) {
    this.time = time;
}

module.exports = RoundTimer;

RoundTimer.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 9,
        data: {
            timer: this.time
        }
    });

    return buf;
};
