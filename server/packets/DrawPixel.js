const msgpack = require("msgpack-lite");

function DrawPixel(f, s) {
    this.f = f;
    this.s = s;
}

module.exports = DrawPixel;

DrawPixel.prototype.build = function () {
   const buf = msgpack.encode({
        opcode: 14,
        data: {
            position: [this.f[0], this.f[1], this.s[0], this.s[1]]
        }
    });

    return buf;
};
