const WebSocket = require("ws");
const log4js = require("log4js");
const Player = require("./Player");
const Packets = require("./packets/packets");
const BinaryReader = require("./utils/BinaryReader");
const msgpack = require("msgpack-lite");
const config = require("config");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const db = require("./database/Database");

const Trivia = require("./gamemodes/trivia/Trivia");
const Skribbl = require("./gamemodes/skribbl");

let logger;

class GameServer {
    constructor({ gamemode, owner, id, port }) {
        this.owner = owner;
        this.id = id;
        this.port = port;
        this.wss = new WebSocket.Server({ port });

        this.wss.on('connection', this.onConnection.bind(this));

        this.gameType = gamemode;
        this.gamemodes = [Trivia, Skribbl];
        this.gamemode = new (this.gamemodes[this.gameType])(this);
        this.gamemodeStrings = ["Trivia", "Skribbl"]
        this.gamemodeString = this.gamemodeStrings[this.gameType];

        this.state = "LOBBY";
        this.players = []
        this.interval = null;

        this.minPlayers = 5;

        this.startTime = config.get("gameserver.countdown");

        logger = log4js.getLogger("GAMESERVER " + this.id);
        logger.level = "debug";

        logger.debug("Server is running on port: " + port);
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
        this.startTime = config.get("gameserver.countdown");
        this.gamemode = new (this.gamemodes[this.gameType])(this);
    }

    onConnection(ws, req) {
        if (this.state == "LOBBY" || this.state == "COUNTDOWN") {
            const ip = req.socket.remoteAddress;
            let player = null;
            
            ws.onmessage = (message) => {
                const msg = msgpack.decode(message.data);
                
                switch(msg.opcode) {
                    case 0:
                        const token = req.url.split("token=")[1];
                        const { username } = msg.data;
                        
                        if (username.length > 0 && username.length < 12) {
                            if (token != null) {
                                jwt.verify(token, process.env.TOKEN_SECRET, (err, { username }) => {
                                    db.get().collection("users").findOne({ username }, (err, user) => {
                                        var playerObj = new Player({ ip, ws, game: this, account: user });

                                        playerObj.nickname = username;
                                        player = playerObj;

                                        this.players.push(playerObj);
                                        this.broadcast(new Packets.PlayerList(this.players));

                                        this.startGame();
                                    });
                                });
                            } else {
                                var playerObj = new Player({ ip, ws, game: this });

                                playerObj.nickname = username;
                                player = playerObj;

                                this.players.push(playerObj);
                                this.broadcast(new Packets.PlayerList(this.players));

                                this.startGame();
                            }
                        }
                        
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

    startGame() {
        if (this.players.length >= this.minPlayers) {
            this.broadcast(new Packets.GameType(this.gameType));

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
                }
            }, 1000)
        }
    }
}

module.exports = GameServer;