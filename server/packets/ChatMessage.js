const BinaryWriter = require("../utils/BinaryWriter");

function ChatMessage(sender, message) {
    this.sender = sender;
    this.message = message;
}

module.exports = ChatMessage;

ChatMessage.prototype.build = function () {
    const writer = new BinaryWriter();
    
    writer.writeUInt8(10);
    writer.writeUInt8(this.sender.length);
    writer.writeStringUtf8(this.sender);
    writer.writeUInt8(this.message.length);
    writer.writeStringUtf8(this.message);

    return writer.toBuffer();
};
