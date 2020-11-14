const Packets = require("../../packets/packets");
const config = require('config');


module.exports = class {
    constructor(gameserver) {
        this.gameServer = gameserver;

        this.cards = []
    }
}