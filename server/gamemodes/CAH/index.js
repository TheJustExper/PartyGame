const Packets = require("../../packets/packets");
const config = require('config');

module.exports = class {
    constructor(gameserver) {
        this.gameServer = gameserver;
    }

    onGameStart() {
        const players = this.gameServer.players;
        const random = Math.floor(Math.random() * players.length);
        const randomPlayer = players[random];
    }
}