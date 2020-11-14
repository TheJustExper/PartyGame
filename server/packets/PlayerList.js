const msgpack = require("msgpack-lite");

function PlayerList(players) {
    this.players = players;
}

module.exports = PlayerList;

PlayerList.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 1,
        data: {
            players: this.players.map(({ nickname, rank, color, account }) => ({
                 nickname,
                 rank,
                 color,
                 level: account ? account.level : 0
            }))
        }
    });

    return buf;
};
