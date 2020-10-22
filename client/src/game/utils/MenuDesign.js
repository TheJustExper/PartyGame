export default class {
    constructor(core) {
        this.core = core;
    }

    loadMenu(type) {
        const menu = document.getElementById("menu");

        if (type == 1) {
            menu.innerHTML = `
                <div class="section left">
                <div class="sections gameType">
                    <h1 id="state">Waiting...</h1>
                </div>
                <div id="start" class="sections">
                    <div class="text">
                        <h1>START</h1>
                        <p>Selected mode: <span>Normal</span></p>
                    </div>
                    <div class="slide"></div>
                </div>
                <div id="settings" class="sections">
                    <div class="text">
                        <h1>SETTINGS</h1>
                        <p>CHOOSE SETTINGS</p>
                    </div>
                    <div class="slide"></div>
                </div>
                <div id="leave" class="sections">
                    <div class="text">
                        <h1>LEAVE</h1>
                        <p>LEAVE THE GAME</p>
                    </div>
                    <div class="slide"></div>
                </div>
            </div>
            <div class="section lobby"></div>
        `;
        } else {
            document.body.style = "justify-content: unset";
            menu.style = "width: 100%; height: auto; justify-content: center;"

            if (type == 2) {
                menu.innerHTML = `             
                <div id="leaderboard"></div>
                <div id="trivia">
                    <div id="infoBox"></div>
                    <div id="questionContainer"><h1 id="question"></h1></div>
                    <div id="answers"></div>
                </div><div id="playersVoted"></div>`;

                    // <div id="chatbox"><div id="messages"></div>
                    // <input id="message" placeholder="Enter a message"/></div>

                // const input = document.getElementById("message");
                // input.onkeydown = (event) => {
                //     if(event.key === 'Enter') {
                //         this.core.socket.sendMessage(input.value);     
                //         input.value = "";
                //     }
                // }

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
            }
        }
    }
}