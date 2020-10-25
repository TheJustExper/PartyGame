const BinaryWriter = require("../utils/BinaryWriter");

function SendCatagory(catagories) {
    this.catagories = catagories;
}

module.exports = SendCatagory;

SendCatagory.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(11);
    writer.writeUInt8(this.catagories.length);

    this.catagories.forEach((catagory) => {
        writer.writeUInt8(catagory.length);
        writer.writeStringUtf8(catagory);
    });

    return writer.toBuffer();
};
