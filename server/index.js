const config = require("config");
const WebSocket = require("ws");
const GameServer = require("./GameServer");
const log4js = require("log4js");
const logger = log4js.getLogger("MASTER");
const db = require("./database/Database");
const Packets = require("./packets/packets");
const msgpack = require("msgpack-lite");

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
    new GameServer({ id: 1, port: 5050 });
    
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
});

