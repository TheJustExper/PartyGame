const BinaryWriter = require("../utils/BinaryWriter");

function AwaitingCatagory() {}

module.exports = AwaitingCatagory;

AwaitingCatagory.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(12);

    return writer.toBuffer();
};
