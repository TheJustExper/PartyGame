const BinaryWriter = require("../utils/BinaryWriter");

function StartGame(timer) {
    this.timer = timer;
}

module.exports = StartGame;

StartGame.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(2);
    writer.writeUInt8(this.timer);

    return writer.toBuffer();
};
