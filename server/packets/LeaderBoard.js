const BinaryWriter = require("../utils/BinaryWriter");

function Leaderboard(players) {
    this.players = players;
}

module.exports = Leaderboard;

Leaderboard.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(3);
    writer.writeUInt8(this.players.length);

    this.players.forEach(({ score, nickname, color }) => {
        writer.writeUInt8(score);
        writer.writeUInt8(nickname.length);
        writer.writeStringUtf8(nickname);
        writer.writeUInt8(color.length);
        writer.writeStringUtf8(color);
    });

    return writer.toBuffer();
};
