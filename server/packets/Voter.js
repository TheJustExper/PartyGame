const msgpack = require("msgpack-lite");

function SendVoter(color) {
    this.color = color;
}

module.exports = SendVoter;

SendVoter.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 7,
        data: {
            color: this.color
        }
    });

    return buf;
};
