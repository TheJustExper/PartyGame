const BinaryWriter = require("../utils/BinaryWriter");

function ResetBoard() {}

module.exports = ResetBoard;

ResetBoard.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(15);

    return writer.toBuffer();
};
