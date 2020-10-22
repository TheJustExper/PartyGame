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

    this.players.forEach(({ nickname }) => {
        writer.writeUInt8(id);
        writer.writeUInt8(nickname.length);
        writer.writeStringUtf8(nickname);
        id++;
    });

    return writer.toBuffer();
};
