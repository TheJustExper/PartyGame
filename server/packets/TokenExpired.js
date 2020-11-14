const msgpack = require("msgpack-lite");

function TokenExpired(servers) {}

module.exports = TokenExpired;

TokenExpired.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 19,
        data: {}
    });

    return buf;
};


