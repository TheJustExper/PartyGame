const BinaryWriter = require("../utils/BinaryWriter");

function ResetScreen(players) {
    this.players = players;
}

module.exports = ResetScreen;

ResetScreen.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(13);

    return writer.toBuffer();
};
