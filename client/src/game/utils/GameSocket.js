import PacketHandler from "../packets/PacketHandler";
import "./StringView"

export default class {
    constructor(core, ip) {
        this.core = core;
        this.ip = ip;
        this.packetHandler = new PacketHandler(core);
        this.socket = new WebSocket(ip);
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onmessage = this.onMessage.bind(this);
    }

    sendUsername(username) {
        const buf = msgpack.encode({ 
            opcode: 0, 
            data: { username }
        });

        this.send(buf);
    }

    sendMessage(message) {
        const buf = msgpack.encode({ 
            opcode: 10, 
            data: { message }
        });

        this.send(buf);
    }

    sendStart() {
        const buf = new DataView(new ArrayBuffer(1));
        buf.setUint8(0, 1);
        this.send(buf);
    }

    sendAnswer(index) {
        const buf = msgpack.encode({ 
            opcode: 2, 
            data: { id: index }
        });

        this.send(buf);
    }

    sendCatagory(catagory) {
        const buf = msgpack.encode({ 
            opcode: 3, 
            data: { catagory }
        });

        this.send(buf);
    }

    sendPixel(x1, y1, x2, y2) {
        const buf = msgpack.encode({ 
            opcode: 4, 
            data: { 
                position: [x1, y1, x2, y2]
             }
        });

        this.send(buf);
    }

    sendResetBoard() {
        const buf = msgpack.encode({ 
            opcode: 5, 
            data: {}
        });

        this.send(buf);
    }

    sendLogin(username, password) {
        const buf = msgpack.encode({ 
            opcode: 1, 
            data: {
                username,
                password,
            }
        });

        this.send(buf);
    }

    sendToken(token) {
        const buf = msgpack.encode({ 
            opcode: 3, 
            data: { token }
        });

        this.send(buf);
    }

    onOpen() {
        if (this.ip.split(":")[2] != "8080") {
            this.core.serverJoined();
        }
    }

    onceUsernameIsSent() {
        this.core.loadLobbyMenu();
        const start = document.getElementById("start");

        start.onclick = () => this.sendStart();

    }

    send(buf) {
        if (this.socket.readyState == WebSocket.OPEN) this.socket.send(buf);
    }

    onClose() {}

    onMessage(data) {
        this.packetHandler.handlePacket(data);
    }
}
