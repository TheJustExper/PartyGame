const msgpack = require("msgpack-lite");

function SendCatagory(catagories) {
    this.catagories = catagories;
}

module.exports = SendCatagory;

SendCatagory.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 11,
        data: {
            catagories: this.catagories
        }
    });

    return buf;
};
