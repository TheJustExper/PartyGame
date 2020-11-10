const msgpack = require("msgpack-lite");

function ResetBoard() {}

module.exports = ResetBoard;

ResetBoard.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 15,
        data: {}
    });

    return buf;
};
