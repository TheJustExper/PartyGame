const msgpack = require("msgpack-lite");

function EndGame() {}

module.exports = EndGame;

EndGame.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 4,
        data: {}
    });

    return buf;
};
