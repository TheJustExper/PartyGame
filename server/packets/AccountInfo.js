const msgpack = require("msgpack-lite");

function AccountInfo(username) {
    this.username = username;
}

module.exports = AccountInfo;

AccountInfo.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 16,
        data: {
            username: this.username
        }
    });

    return buf;
};
