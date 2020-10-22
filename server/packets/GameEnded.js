const BinaryWriter = require("../utils/BinaryWriter");

function GameEnded(players) {
    this.players = players;
}

module.exports = GameEnded;

GameEnded.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(8);

    return writer.toBuffer();
};
