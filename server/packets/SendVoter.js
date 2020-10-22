const BinaryWriter = require("../utils/BinaryWriter");

function SendVoter(color) {
    this.color = color;
}

module.exports = SendVoter;

SendVoter.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(7);
    writer.writeUInt8(this.color.length);
    writer.writeStringUtf8(this.color);

    return writer.toBuffer();
};
