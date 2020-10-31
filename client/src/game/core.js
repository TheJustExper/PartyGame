
import GameSocket from "./utils/GameSocket";
import MenuDesign from "./utils/MenuDesign";

import Music from "./audio/music_zapsplat_quiz_bed_concentration.mp3";
import Win from "./audio/win.mp3";

window.DEBUG = true;

export default class {
    constructor() {
        this.players = []
        this.leaderboard = []

        this.socket = null; 
        this.menus = new MenuDesign(this);
        this.gamemode = null;

        this.trivia = {}
        this.sentAnswer = null;
        
        this.gameType = null;

        this.timer = null;
        this.lobby = null;

        this.state = "LOBBY";

        this.roundTime = 0;
        this.timer = null;

        this.audio = {
            music: new Audio(Music),
            win: new Audio(Win)
        }

        this.setup();
    }

    setup() {
        const servers = document.getElementById("servers");
        const fade = document.getElementById("fade");
        const serverList = document.getElementById("serverList");

        servers.onclick = () => {
            const close = document.getElementById("serverClose");

            fade.style = "display: block";
            serverList.style = "display: block";

            close.onclick = () => {
                fade.style = "display: none";
                serverList.style = "display: none";
            }
        }

        const serverL = document.querySelector(".server #join")

        serverL.onclick = (data) => {
            let ip = data.target.parentElement.getAttribute("ip");
            this.socket = new GameSocket(this, ip);
        }
    }

    showGamemodeScreen() {
        this.gamemode.renderScreen();
    }

    playButtonClicked() {
        this.username = document.getElementById("username").value;
        this.lobby = document.querySelector(".lobby");
    }

    setLeaderboard(players) {
        const leaderboard = document.getElementById("leaderboard");
        leaderboard.innerHTML = "";
       
        players.sort((a, b) => b.points - a.points).forEach(({ name, points, color }, index) => {
            leaderboard.innerHTML += `
            <div class="boardItem">
                <div class="text">
                    <p><b style="margin-right: 5px;">#${index + 1}</b> ${name}</p>
                    <p>Points: <b>${points}</b></p>
                </div>
                <span class="color" style="background-color: ${color};"></span>
            </div>`
        });
    }

    roundEndResult(correct) {
        const answer = document.getElementById("answer-" + this.sentAnswer);
        answer.style = correct == 1 ? "background-color: #00ff9d" : "background-color: #ff003c;";
    }
    
    setRoundTimer(timer) {
        const roundTime = document.getElementById("roundTime");
        roundTime.innerText = timer;
    }

    showQuestion(quest) {
        const question = document.getElementById("question");
        question.innerText = quest.question;

        const infoBox = document.getElementById("infoBox");
        infoBox.innerHTML = `<h1>Round Timer: <b id="roundTime">10<b></h1>`;

        const answers = document.getElementById("answers");
        answers.innerHTML = "";
        quest.answers.forEach((answer, index) => {
            answers.innerHTML += `<span id="answer-${index}" style="background-color: rgb(97 104 117);" class="answer" onclick="window.core.sendAnswer(${index})">${answer}</span>`;
        });
    }

    resetScreen() {
        const screen = document.getElementById("awaitingText");
        if (screen != null) {
            screen.style = "display: none";
            screen.remove();
        }

        const screen2 = document.getElementById("awaiting");
        if (screen2 != null) {
            screen2.style = "display: none";
            screen2.remove();
        }

        const catagories = document.getElementById("catagories");
        if (catagories != null) {
            catagories.style = "display: none";
            catagories.remove();
       }

       this.showGamemodeScreen();
    }

    addMessage(color, name, message) {
        const messages = document.getElementById("messages");
        
        messages.innerHTML += `
        <div class="message">
            <p><b class="name" style="color: ${color != null ? color : "white"}">${name}:</b> ${message}</p>
        </div>`

        messages.scrollTop = messages.scrollHeight;
    }

    serverJoined() {
        document.body.innerHTML = `
            <div id="menu">
            <div class="section left">
                <input placeholder="Username" value="Testing" id="username"/>
                <div id="play" class="sections">
                    <div class="text">
                        <h1>Play</h1>
                        <p>Selected mode: <span>Normal</span></p>
                    </div>
                    <div class="slide"></div>
                </div>
            </div>
        `

        const play = document.getElementById("play");
        const username = document.getElementById("username");

        play.onclick = () => {
            window.core.playButtonClicked();
            window.core.socket.sendUsername(username.value);
        }
    }

    onGameEnd() {
        const leaderboard = document.getElementById("leaderboard");
        const menu = document.getElementById("menu");
        document.body.style = "justify-content: center;";
        leaderboard.style = `width: 450px; padding-top: 10px; display: flex; flex-direction: column; position: relative; animation: tada; animation-duration: 2s; `;
        menu.innerHTML = leaderboard.outerHTML;
        // menu.innerHTML += "<div id='header'></div>";
        // const header = document.getElementById("header");
        // header.style += "animation: tada; animation-duration: 2s;"
        this.audio.win.volume = 0.1;
        this.audio.win.play();
    }

    addPlayerVoted(color) {
        const playersVoted = document.getElementById("playersVoted");
        playersVoted.innerHTML += `
            <div class="color" style="background-color: ${color}"></div>
        `
    }

    onCatagories(catagories) {
        const catagory = document.createElement("div");
        catagory.id = "catagories";

        catagory.innerHTML = "<h1>Choose a catagory</h1><div id='list'></div>";

        document.body.appendChild(catagory);

        const catagory2 = document.createElement("div");
        catagory2.id = "awaiting";

        document.body.appendChild(catagory2);
        
        const list = document.getElementById("list");

        catagories.forEach((cat, index) => {
            list.innerHTML += `
                <div class="catagory" onclick="window.core.socket.sendCatagory(${index});">${cat}</div>
            `;
        });
    }

    onAwaitingCatagory() {
        const screen = document.createElement("div");
        screen.id = "awaitingText";
        screen.innerHTML += "<h1>Awaiting catagory selection...</h1>";

        const text = document.createElement("div");
        text.id = "awaiting";

        document.body.appendChild(screen);
        document.body.appendChild(text)
    }

    resetVoters() {
        const playersVoted = document.getElementById("playersVoted");
        playersVoted.innerHTML = "";
    }

    setPlayers(players) {
        this.lobby.innerHTML = "";
        this.players = players;
        this.players.forEach(({ id, name}) => {
            this.lobby.innerHTML += `<div class="player"><b style="color: #8C9399; margin-right: 15px;">ID: <span style="color: gold; margin-left: 5px;">${id}</span></b><b> ${name.toUpperCase()}</b></div>`;
        });
    }

    sendAnswer(index) {
        if (this.sentAnswer == null) {
            const answer = document.getElementById("answer-" + index);
            answer.style = "background-color: rgb(36 38 43)";

            this.socket.sendAnswer(index)
            this.sentAnswer = index; 
        }
    }

    resetLobby() {
        this.lobby = document.querySelector(".lobby");

        if (this.socket != null) {
            this.lobby.innerHTML = "";
        }
    }
}