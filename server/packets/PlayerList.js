const BinaryWriter = require("../utils/BinaryWriter");

function PlayerList(players) {
    this.players = players;
}

module.exports = PlayerList;

PlayerList.prototype.build = function () {
    const writer = new BinaryWriter();
    let id = 1;
    writer.writeUInt8(1);
    writer.writeUInt8(this.players.length);

    this.players.forEach(({ nickname, rank, color }) => {
        writer.writeUInt8(id);
        writer.writeUInt8(nickname.length);
        writer.writeStringUtf8(nickname);
        writer.writeUInt8(rank.length);
        writer.writeStringUtf8(rank);
        writer.writeUInt8(color.length);
        writer.writeStringUtf8(color);
        id++;
    });

    return writer.toBuffer();
};
