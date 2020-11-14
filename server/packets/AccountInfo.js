const msgpack = require("msgpack-lite");

function AccountInfo(data) {
    this.data = data;
}

module.exports = AccountInfo;

AccountInfo.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 16,
        data: this.data
    });

    return buf;
};
