const BinaryWriter = require("../utils/BinaryWriter");

function EndGame() {}

module.exports = EndGame;

EndGame.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(4);

    return writer.toBuffer();
};
