const msgpack = require("msgpack-lite");

function ChatMessage(sender, message, color) {
    this.sender = sender;
    this.message = message;
    this.color = color;
}

module.exports = ChatMessage;

ChatMessage.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 10,
        data: {
            username: this.sender,
            color: this.color,
            message: this.message,
        }
    });

    return buf;
};
