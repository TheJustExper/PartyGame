const BinaryWriter = require("../utils/BinaryWriter");

function ChatMessage(sender, message, color) {
    this.sender = sender;
    this.message = message;
    this.color = color;
}

module.exports = ChatMessage;

ChatMessage.prototype.build = function () {
    const writer = new BinaryWriter();
    
    writer.writeUInt8(10);
    writer.writeUInt8(this.sender.length);
    writer.writeStringUtf8(this.sender);
    writer.writeUInt8(this.message.length);
    writer.writeStringUtf8(this.message);
    writer.writeUInt8(this.color.length);
    writer.writeStringUtf8(this.color);

    return writer.toBuffer();
};
