const config = require("config");
const WebSocket = require("ws");
const GameServer = require("./GameServer");
const log4js = require("log4js");
const logger = log4js.getLogger("MASTER");
const db = require("./database/Database");
const BinaryReader = require("./utils/BinaryReader");

logger.level = "debug";


db.connect(() => {
    const wss = new WebSocket.Server({ port: config.get("MAIN_SERVER").port });
    new GameServer({ id: 1, port: 5050 });
    
    wss.on('connection', (ws, req) => {
        logger.debug("New connection to the Main server");

        ws.onmessage = (message) => {
            let msg = new BinaryReader(message);

            switch(msg.getUint8()) {
                case 1:
                    const username = msg.readStringUtf8();
                    const password = msg.readStringUtf8();

                    console.log(username, password);
                    break;

            }   
        }

        //db.get().collection("users").find({}).forEach(u => console.log(u))
    });
});

