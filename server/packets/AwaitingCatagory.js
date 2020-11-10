const msgpack = require("msgpack-lite");

function AwaitingCatagory() {}

module.exports = AwaitingCatagory;

AwaitingCatagory.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 12,
    });

    return buf;
};
