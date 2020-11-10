const msgpack = require("msgpack-lite");

function GameType(type) {
    this.type = type;
}

module.exports = GameType;

GameType.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 0,
        data: {
            type: this.type
        }
    });

    return buf;
};
