const config = require("config");
const WebSocket = require("ws");
const GameServer = require("./GameServer");
const log4js = require("log4js");
const logger = log4js.getLogger("MASTER");

logger.level = "debug";

const wss = new WebSocket.Server({ port: config.get("MAIN_SERVER").port });
new GameServer({ id: 1, port: 5050 });

wss.on('connection', (ws, req) => {
    logger.debug("New connection to the Main server");
});