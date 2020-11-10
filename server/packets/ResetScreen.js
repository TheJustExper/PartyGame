const msgpack = require("msgpack-lite");

function ResetScreen(players) {
    this.players = players;
}

module.exports = ResetScreen;

ResetScreen.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 13,
        data: {}
    });

    return buf;
};
