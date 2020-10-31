import PacketHandler from "../packets/PacketHandler";
import "./StringView"

export default class {
    constructor(core, ip) {
        this.core = core;
        this.packetHandler = new PacketHandler(core);
        this.socket = new WebSocket(ip);
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onmessage = this.onMessage.bind(this);
    }

    createString(opcode, str) {
        var msg = new DataView(new ArrayBuffer(1 + str.length * 2));
        msg.setUint8(0, opcode);
        for (var i = 0; i < str.length; ++i) msg.setUint16(1 + 2 * i, str.charCodeAt(i), true);
        return msg;
    }

    sendUsername(name) {
        let str = this.createString(0, name);
        this.send(str);
    }

    sendMessage(message) {
        let str = this.createString(10, message);
        this.send(str);

        console.log(message)
    }

    sendStart() {
        const buf = new DataView(new ArrayBuffer(1));
        buf.setUint8(0, 1);
        this.send(buf);
    }

    sendAnswer(index) {
        const buf = new DataView(new ArrayBuffer(2));
        buf.setUint8(0, 2);
        buf.setUint8(1, index)
        this.send(buf);
    }

    sendCatagory(catagory) {
        const buf = new DataView(new ArrayBuffer(2));
        buf.setUint8(0, 3);
        buf.setUint8(1, catagory)
        this.send(buf);
    }

    sendPixel(x1, y1, x2, y2) {
        const buf = new DataView(new ArrayBuffer(9));
        buf.setUint8(0, 4);
        buf.setUint16(1, x1)
        buf.setUint16(3, y1)
        buf.setUint16(5, x2)
        buf.setUint16(7, y2)
        this.send(buf);
    }

    onOpen() {
        this.core.serverJoined();
    }

    onceUsernameIsSent() {
        this.core.menus.loadMenu(1);
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
