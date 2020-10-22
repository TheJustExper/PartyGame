const BinaryWriter = require("../utils/BinaryWriter");

function RoundEnd(answer) {
    this.answer = answer;
}

module.exports = RoundEnd;

RoundEnd.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(6);
    writer.writeUInt8(this.answer);

    return writer.toBuffer();
};
