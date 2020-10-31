const BinaryWriter = require("../utils/BinaryWriter");

function GameType(type) {
    this.type = type;
}

module.exports = GameType;

GameType.prototype.build = function () {
    const writer = new BinaryWriter();

    writer.writeUInt8(0);
    writer.writeUInt8(this.type)

    return writer.toBuffer();
};
