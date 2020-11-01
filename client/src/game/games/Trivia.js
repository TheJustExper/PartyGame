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
        document.body.style = "justify-content: unset";
        menu.style = "width: 100%; height: auto; justify-content: center;"

        menu.innerHTML = `             
        <div id="leaderboard"></div>
        <div id="trivia">
            <div id="infoBox"></div>
            <div id="questionContainer"><h1 id="question"></h1></div>
            <div id="answers"></div>
        </div><div id="playersVoted"></div>`;


        const lb = document.getElementById("leaderboard");

        this.core.leaderboard.sort((a, b) => b.score - a.score).forEach(({ rank, name, points }) => {
            lb.innerHTML += `
            <div class="boardItem">
                <div class="text">
                    <p><b style="margin-right: 5px;">#${rank}</b> ${name}</p>
                    <p>Points: <b>${points}</b></p>
                </div>
                <span class="color" style="
                    background-color: red;
                    height: 50px;
                    width: 50px;
                    position: absolute;
                    right: 0;
                "></span>
            </div>`
        });

        const chatbox = document.getElementById("chatInput");

        chatbox.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
              event.preventDefault();
              window.core.socket.sendMessage(chatbox.value);
              chatbox.value = "";
            }
        });
    }
}