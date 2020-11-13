const config = require("config");
const WebSocket = require("ws");
const GameServer = require("./GameServer");
const log4js = require("log4js");
const logger = log4js.getLogger("MASTER");
const db = require("./database/Database");
const Packets = require("./packets/packets");
const msgpack = require("msgpack-lite");

let servers = []

logger.level = "debug";

function sendPacket(ws, packet) {
    if (packet == null) return;
    if (ws.readyState == WebSocket.OPEN) {
        var buffer = packet.build();
        if (buffer != null) {
            ws.send(buffer, { binary: true });
        }
    }
}


db.connect(() => {
    const wss = new WebSocket.Server({ port: config.get("MAIN_SERVER").port });

    servers.push(new GameServer({ id: 1, port: 5050, gamemode: 0 }));
    servers.push(new GameServer({ id: 2, port: 5040, gamemode: 1 }));
    servers.push(new GameServer({ id: 3, port: 5030, gamemode: 0 }));
    servers.push(new GameServer({ id: 2, port: 5020, gamemode: 1 }));
    
    wss.on('connection', (ws, req) => {
        logger.debug("New connection to the Main server");

        ws.onmessage = (message) => {
            const msg = msgpack.decode(message.data);

            switch(msg.opcode) {
                case 1:
                    const { username, password } = msg.data;

                    if (username == "Exper" && password == "test") {
                        console.log("Player logged in as: " + username)
                        sendPacket(ws, new Packets.AccountInfo(username));
                    }
                    break;

            }   
        }

        //db.get().collection("users").find({}).forEach(u => console.log(u))
    });

    setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                let mapped = servers.map(server => ({ gamemode: server.gamemodeString, port: server.port, players: server.players.length }));
                let packet = new Packets.ServerList(mapped);

                sendPacket(ws, packet);
            }
        })
    }, 3000);
});

