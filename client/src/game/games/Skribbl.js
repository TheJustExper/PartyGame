export default class {
    constructor(core) {
        this.core = core;

        this.canvas = null;
        this.ctx = null;

        this.x = "black";
        this.y = 2;
        this.prevX = 0;
        this.prevY = 0;
        this.currX = 0;
        this.currY = 0;
        this.dot_flag = false;
        this.flag = false;
    }

    setRoundTimer(timer) {
        const roundTime = document.getElementById("roundTime");
        roundTime.innerText = timer;
    }

    renderScreen() {
        const menu = document.getElementById("menu");
        menu.innerHTML = `
            <div id="leaderboard"></div>
            <div id="container">
                <div id="infoBox"></div>
                <canvas id="game"></canvas>
            </div>
            <div id="chatbox">
                <div id="messages"></div>
                <input id="chatInput" placeholder="Send a message"/>
            </div>
        `;

        const infoBox = document.getElementById("infoBox");
        infoBox.innerHTML = `<h1>Round Timer: <b id="roundTime">10<b></h1>`;

        const chatbox = document.getElementById("chatInput");

        chatbox.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
              event.preventDefault();
              window.core.socket.sendMessage(chatbox.value);
              chatbox.value = "";
            }
        });

        this.canvas = document.getElementById("game");
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext("2d");

        this.resetBoard();

        let d = this;

        document.body.onkeyup = (({ keyCode }) => {
            if (keyCode == 32) {
                window.core.socket.sendResetBoard();
            }
        });

        this.canvas.addEventListener("mousemove", (e) => d.findxy('move', e), false);
        this.canvas.addEventListener("mousedown", (e) => d.findxy('down', e), false);
        this.canvas.addEventListener("mouseup",   (e) => d.findxy('up',   e), false);
        this.canvas.addEventListener("mouseout",  (e) => d.findxy('out',  e), false);
    }

    resetBoard() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    findxy(res, e) {
        if (res == 'down') {
            this.prevX = this.currX;
            this.prevY = this.currY;
            this.currX = e.clientX - this.canvas.offsetLeft;
            this.currY = e.clientY - this.canvas.offsetTop;
    
            this.flag = true;
        }
        if (res == 'up' || res == "out") this.flag = false;
        if (res == 'move') {
            if (this.flag) {
                this.prevX = this.currX;
                this.prevY = this.currY;
                this.currX = e.clientX - this.canvas.offsetLeft;
                this.currY = e.clientY - this.canvas.offsetTop;

                window.core.socket.sendPixel(this.prevX, this.prevY, this.currX, this.currY);
            }
        }
    }

    drawFromServer(x1, y1, x2, y2) {
        this.draw(x1, y1, x2, y2);
    }

    draw(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = this.x;
        this.ctx.lineWidth = this.y;
        this.ctx.stroke();
        this.ctx.closePath();
    }
}