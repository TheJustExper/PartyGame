const WebSocket = require("ws");
const log4js = require("log4js");
const Player = require("./Player");
const Packets = require("./packets/packets");
const BinaryReader = require("./utils/BinaryReader");
const config = require("config");

const Trivia = require("./gamemodes/trivia/Trivia");

let logger;

class GameServer {
    constructor({ owner, id, port }) {
        this.owner = owner;
        this.id = id;
        this.wss = new WebSocket.Server({ port });

        this.wss.on('connection', this.onConnection.bind(this));

        this.gamemode = new Trivia(this);

        this.state = "LOBBY";
        this.players = []
        this.interval = null;

        this.startTime = config.get("gameserver.countdown");

        logger = log4js.getLogger("GAMESERVER " + this.id);
        logger.level = "debug";
    }

    getPlayer = (ip) => this.players.find(user => user.ip == ip);

    broadcast(packet) {
        this.players.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.sendPacket(packet);
            }
        });
    }

    resetLobby() {
        this.state = "LOBBY";
        this.players = [];
        this.startTime = 3;
    }

    onConnection(ws, req) {
        if (this.state == "LOBBY" || this.state == "COUNTDOWN") {
            const ip = req.socket.remoteAddress;
            let player = null;
            
            ws.onmessage = (message) => {
                const msg = new BinaryReader(message.data);
                
                switch(msg.readUInt8()) {
                    case 0:
                        const username = msg.readStringUtf8();
                        const playerObj = new Player({ ip, ws, game: this });

                        playerObj.nickname = username.replace(/ /g, '');
                        player = playerObj;

                        this.players.push(playerObj);
                        this.broadcast(new Packets.PlayerList(this.players));

                        this.startGame();

                        logger.debug(`A new player has been created - ID: ${playerObj.id}`);
                        
                        break;
                }
            }

            ws.onclose = () => {
                if (player != null) {
                    logger.debug("Player: " + player.id + " has left the game");

                    this.players.splice(this.players.findIndex(p => p.id == player.id), 1);

                    if (this.state == "LOBBY" || this.state == "COUNTDOWN") {
                        this.broadcast(new Packets.PlayerList(this.players));
                    } else {
                        this.broadcast(new Packets.LeaderBoard(this.players));
                    }

                    if (this.state == "INGAME" || this.state == "COUNTDOWN") {
                        if (this.players.length == 1) {
                            this.broadcast(new Packets.EndGame());
                            this.resetLobby();
                        }
                    }
                }
            }
        }
    }

    onChatMessage(from, message) {
        this.broadcast(new Packets.ChatMessage(from, message));
    }

    startGame() {
        if (this.players.length >= 2) {
            let time = this.startTime;
            this.state = "COUNTDOWN";
            
            clearInterval(this.interval);
            this.interval = setInterval(() => {
                this.broadcast(new Packets.StartGame(time));
                time -= 1;
    
                if (time == -1) {
                    clearInterval(this.interval);
                    this.state = "INGAME";
                    this.gamemode.onGameStart();
                    
                    this.broadcast(new Packets.LeaderBoard(this.players));
                }
            }, 1000)
        }
    }
}

module.exports = GameServer;