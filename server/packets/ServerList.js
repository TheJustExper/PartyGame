const msgpack = require("msgpack-lite");

function ServerList(servers) {
    this.servers = servers;
}

module.exports = ServerList;

ServerList.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 17,
        data: {
            servers: this.servers
        }
    });

    return buf;
};


