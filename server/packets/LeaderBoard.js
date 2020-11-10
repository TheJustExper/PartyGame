const msgpack = require("msgpack-lite");

function Leaderboard(players) {
    this.players = players;
}

module.exports = Leaderboard;

Leaderboard.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 3,
        data: {
            players: this.players.map(({ score, nickname, color }) => ({
                score,
                nickname,
                color
           }))
        }
    });

    return buf;
};
