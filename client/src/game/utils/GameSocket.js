import PacketHandler from "../packets/PacketHandler";
import "./StringView"

export default class {
    constructor(core) {
        this.core = core;
        this.packetHandler = new PacketHandler(core);
        this.socket = new WebSocket("ws://localhost:5050");
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onmessage = this.onMessage.bind(this);
    }

    sendUsername(name) {
        var msg = new DataView(new ArrayBuffer(1 + name.length * 2));
        msg.setUint8(0, 0);
        for (var i = 0; i < name.length; ++i) msg.setUint16(1 + 2 * i, name.charCodeAt(i), true);
        this.send(msg);
    }

    sendMessage(message) {
        var msg = new DataView(new ArrayBuffer(1 + message.length * 2));
        msg.setUint8(0, 10);
        for (var i = 0; i < message.length; ++i) msg.setUint16(1 + 2 * i, message.charCodeAt(i), true);
        this.send(msg);
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

    onOpen() {}

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

    bufString(s) {
        
    }
}
