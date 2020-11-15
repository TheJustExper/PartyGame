const WebSocket = require('ws');
const log4js = require("log4js");
const logger = log4js.getLogger("PLAYER");
const { PacketType } = require("./packets/packets");
const shortid = require('shortid');
const msgpack = require("msgpack-lite");
const Packets = require("./packets/packets");

logger.level = "debug";
 
class Player {
    /**
     * Create a point.
     * @param {ws} ws - WebSocket.
     * @param {string} ip - Ip of the user.
     */
    constructor({ ws, ip, game, account }) {
        this.game = game;
        this.id = game.players.length + 1;
        this.ws = ws;
        this.ip = ip;
        this.score = 0;
        this.nickname = "Guest";
        this.state = "USERNAME";
        this.color = this.getRandomColor();
        this.rank = account ? "ACCOUNT" : "GUEST";
        this.account = account;

        if (this.account != null) {
            if (this.account.username == "Exper") {
                this.rank = "DEVELOPER";
                this.color = "#0a5efb";
            }
            if (this.account.username == "Magzi" || this.account.username == "Maestro") {
                this.rank = "BETA";
                this.color = "#bb35ff";
            }
        } else {
            this.color = "#b7b7b7";
        }

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
        const msg = msgpack.decode(message);
        
        switch(msg.opcode) {
            case 0:
                const { username } = msg.data;
                this.nickname = username;
                
                this.game.broadcast(new Packets.PlayerList(this.game.players));
                break;
            case 1:
                // Player Game start button click action
                break;
            case 2:
                const { id } = msg.data;
                this.game.gamemode.onAnswer(this, id);
                break;
            case 3:
                const { catagory } = msg.data;
                this.game.gamemode.onPickedCatagory(this, catagory);
                break;
            case 4:
                const [ x1, y1, x2, y2 ] = msg.data.position;

                this.game.gamemode.onDraw(this, x1, y1, x2, y2);
                break;
            case 5:
                this.game.gamemode.resetBoard(this);
                break;
            case 10:
                let { message } = msg.data;
                this.game.gamemode.onChatMessage(this, message);
                break;
        }
    }
}

module.exports = Player;