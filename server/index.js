const config = require("config");
const WebSocket = require("ws");
const GameServer = require("./GameServer");
const log4js = require("log4js");
const logger = log4js.getLogger("MASTER");
const db = require("./database/Database");
const Packets = require("./packets/packets");
const msgpack = require("msgpack-lite");
const Account = require("./utils/Account");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

function sendPacket(ws, packet) { if (packet == null) return; if (ws.readyState == WebSocket.OPEN) { var buffer = packet.build(); if (buffer != null) { ws.send(buffer, { binary: true }); }}}

let servers = []

logger.level = "debug";

async function run() {

    db.connect(async () => {
        const wss = new WebSocket.Server({
            port: config.get("MAIN_SERVER").port
        });

        servers.push(new GameServer({ id: 1, port: 5050, gamemode: 1 }));
        servers.push(new GameServer({ id: 2, port: 5040, gamemode: 0 }));
        servers.push(new GameServer({ id: 3, port: 5030, gamemode: 1 }));

        const users = await db.get().collection("users");

        function sendServerList() {
            wss.clients.forEach((ws) => {
                if (ws.readyState === WebSocket.OPEN) {
                    let mapped = servers.map(server => ({
                        gamemode: server.gamemodeString,
                        port: server.port,
                        players: server.players.length
                    }));
                    let packet = new Packets.ServerList(mapped);

                    sendPacket(ws, packet);
                }
            })
        }

        wss.on('connection', (ws, req) => {
            ws.onmessage = async (message) => {
                const msg = msgpack.decode(message.data);

                switch (msg.opcode) {
                    case 1:
                        var { username, password } = msg.data;            
                        var user = await users.findOne({ username });

                        if (user) {
                            const verified = await bcrypt.compare(password, user.password);

                            if (verified) {
                                var token = jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: '1hr' });
                                var packet = new Packets.AccountToken(token);
                                sendPacket(ws, packet);

                                var info = { username: username, level: user.level }
                                var account = new Packets.AccountInfo(info);
                                sendPacket(ws, account);
                            }
                        }

                        break;
                    case 2:
                        var { username, password } = msg.data;
                        var user = await users.findOne({ username });

                        if (!user) {
                            var password = await Account.genPassword(password);

                            var userCase = { 
                                username, 
                                password, 
                                level: 0, 
                                coins: 0,
                                xp: 0,
                                created: new Date() }

                            var registered = await users.insertOne(userCase);
                            if (registered) logger.debug("Registered user: " + username);
                        } 
                        break;
                    case 3:
                        var { token } = msg.data;

                        try {
                            var userObj = await jwt.verify(token, process.env.TOKEN_SECRET);
                            var user = await users.findOne({ username: userObj.username });
                            var info = { username: user.username, level: user.level }
                            var account = new Packets.AccountInfo(info);
                            sendPacket(ws, account);
                        } catch (err) {
                            sendPacket(ws, new Packets.TokenExpired());
                        }
                        break;

                }
            }
        });

        setInterval(() => {
            sendServerList();
        }, 2000);
    });
}

run();