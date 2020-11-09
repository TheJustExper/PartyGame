const WebSocket = require('ws');
const log4js = require("log4js");
const logger = log4js.getLogger("PLAYER");
const { PacketType } = require("./packets/packets");
const shortid = require('shortid');
const BinaryReader = require("./utils/BinaryReader");
const Packets = require("./packets/packets");

logger.level = "debug";
 
class Player {
    /**
     * Create a point.
     * @param {ws} ws - WebSocket.
     * @param {string} ip - Ip of the user.
     */
    constructor({ ws, ip, game }) {
        this.game = game;
        this.id = game.players.length + 1;
        this.ws = ws;
        this.ip = ip;
        this.score = 0;
        this.rank = "PLAYER";
        this.nickname = "Guest";
        this.state = "USERNAME";
        this.color = this.getRandomColor();

        ws.on("message", this.handleMessage.bind(this));
    }

    sendPacket(packet) {
        if (packet == null) return;
        if (this.ws.readyState == WebSocket.OPEN) {
            var buffer = packet.build(this.game.protocol);
            if (buffer != null) {
                this.ws.send(buffer, { binary: true });
            }
        }
    }

    getRandomColor() {
        let color = "hsl(" + Math.random() * 360 + ", 100%, 75%)";
        return color;
    }

    handleMessage(message) {
        const msg = new BinaryReader(message);
        
        switch(msg.readUInt8()) {
            case 0:
                const username = msg.readStringUtf8();
                this.nickname = username.replace(/ /g, '');
                
                this.game.broadcast(new Packets.PlayerList(this.game.players));
                break;
            case 1:
                // Player Game start button click action
                break;
            case 2:
                const id = msg.readUInt8();
                this.game.gamemode.onAnswer(this, id);
                break;
            case 3:
                const catagory = msg.readUInt8();
                this.game.gamemode.onPickedCatagory(this, catagory);
                break;
            case 4:
                const x1 = msg.readUInt16();
                const y1 = msg.readUInt16();
                const x2 = msg.readUInt16();
                const y2 = msg.readUInt16();

                this.game.gamemode.onDraw(this, x1, y1, x2, y2);
                break;
            case 5:
                this.game.gamemode.resetBoard(this);
                break;
            case 10:
                let message = msg.readStringUtf8();
                this.game.gamemode.onChatMessage(this, message);
                break;
        }
    }
}

module.exports = Player;