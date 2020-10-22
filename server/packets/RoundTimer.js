const BinaryWriter = require("../utils/BinaryWriter");

function RoundTimer(time) {
    this.time = time;
}

module.exports = RoundTimer;

RoundTimer.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(9);
    writer.writeUInt8(this.time);

    return writer.toBuffer();
};
