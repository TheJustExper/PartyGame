const msgpack = require("msgpack-lite");

function AccountToken(token) {
    this.token = token;
}

module.exports = AccountToken;

AccountToken.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 18,
        data: {
            token: this.token
        }
    });

    return buf;
};
