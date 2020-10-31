const BinaryWriter = require("../utils/BinaryWriter");

function DrawPixel(f, s) {
    this.f = f;
    this.s = s;
}

module.exports = DrawPixel;

DrawPixel.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(14);

    writer.writeUInt16(this.f[0]);
    writer.writeUInt16(this.f[1]);

    writer.writeUInt16(this.s[0]);
    writer.writeUInt16(this.s[1]);

    return writer.toBuffer();
};
