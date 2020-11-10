const msgpack = require("msgpack-lite");

function GameEnded(players) {
    this.players = players;
}

module.exports = GameEnded;

GameEnded.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 8,
        data: {}
    });

    return buf;
};
