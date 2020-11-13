
import GameSocket from "./utils/GameSocket";
import MenuDesign from "./utils/MenuDesign";

import Trivia from "./games/Trivia";
import Skribbl from "./games/Skribbl";

import Music from "./audio/menu/ui_intro.mp3";
import Win from "./audio/win.mp3";
import Clicked from "./audio/menu/ui_click1.mp3";

import PopupOpen from "./audio/menu/ui_open_window.mp3";
import PopupClose from "./audio/menu/ui_close_window.mp3";

window.DEBUG = true;

export default class {
    constructor() {
        this.players = []
        this.leaderboard = []

        this.socket = new GameSocket(this, "ws://localhost:8080");

        this.menus = new MenuDesign(this);
        this.gamemodes = [new Trivia(), new Skribbl()]

        this.trivia = {}

        this.gamemode = null;
        this.sentAnswer = null;
        this.gameType = null;
        this.timer = null;
        this.lobby = null;
        this.timer = null;
        this.selectedPopup = null;

        this.state = "LOBBY";
        this.username = "Guest";

        this.roundTime = 0;

        this.audio = {
            music: new Audio(Music),
            win: new Audio(Win),
            buttonClick: new Audio(Clicked),
            popupOpen: new Audio(PopupOpen),
            popupClose: new Audio(PopupClose)
        }   

        this.state = {
            account: {
                account: localStorage.getItem("account")
            }
        }

        this.setup();

        this.audio.music.muted = true;

        document.body.addEventListener("mousedown", function () {
            if (window.core.audio.music.muted) {
                window.core.audio.music.muted = false;
                window.core.audio.music.volume = 0.01;
                window.core.audio.music.play();
            }
        })

        const welcome = document.getElementById("welcome");
        welcome.classList.toggle("show2");
    }

    setup() {
        this.setupPopups();
        this.setupButtons();
    }

    setupPopups() {
        this.setupLogin();
        this.setupSettings();
        this.showWelcome();
    }

    setupLogin() {
        const login = document.getElementById("login");
        const button = document.getElementById("loginButton");
        
        button.onclick = () => this.buttonClick(login);
    }

    showWelcome() {
        const fade = document.getElementById("fade");
        const div = document.getElementById("welcome");
        const close = document.querySelector(`#welcome .exit`);

        fade.style.display = "block";

        close.onclick = () => {
            fade.style.display = "none",  div.classList.toggle("show2"), div.classList.toggle("unshow2");
            window.core.audio.popupClose.play();
        }

        if (div.classList.contains("unshow")) {
            div.classList.toggle("unshow");
        }
    }

    setupSettings() {
        const settings = document.getElementById("settings");
        const button = document.getElementById("settingsButton");
        
        button.onclick = () => this.buttonClick(settings);
    }

    accountAuth() {
        //if (this.state.account.account != null) {
            const { username, password } = { username: "Exper", password: "test" }
            this.socket.sendLogin(username, password);
        //}
    }

    buttonClick(div) {
        const fade = document.getElementById("fade");
        const close = document.querySelector(`#${div.id} .exit`);

        fade.style.display = "block";

        if (div.classList.contains("unshow")) {
            div.classList.toggle("unshow");
        }

        div.classList.toggle("show");

        close.onclick = () => {
            fade.style.display = "none",  div.classList.toggle("show"), div.classList.toggle("unshow");
            window.core.audio.popupClose.play();
        }

        window.core.audio.popupOpen.play();
    }

    setupButtons() {
        const servers = document.getElementById("servers");
        const serverList = document.getElementById("serverList");
        const login = document.getElementById("login");

        login.onclick = () => document.getElementById("profile").outerHTML = this.getProfile();
        servers.onclick = () => this.buttonClick(serverList);
    }

    showGamemodeScreen() {
        this.gamemode.renderScreen();
    }

    playButtonClicked() {
        this.username = document.getElementById("username").value;
        this.lobby = document.querySelector(".lobby");
        window.core.audio.buttonClick.play();
    }

    setLeaderboard(players) {
        const leaderboard = document.getElementById("leaderboard");
        leaderboard.innerHTML = "";
       
        players.sort((a, b) => b.score - a.score).forEach(({ nickname, score, color }, index) => {
            leaderboard.innerHTML += `
            <div class="boardItem">
                <div class="text">
                    <p><b style="margin-right: 5px;">#${index + 1}</b> ${nickname}</p>
                    <p>Points: <b>${score}</b></p>
                </div>
                <span class="color" style="background-color: ${color};"></span>
            </div>`
        });
    }

    roundEndResult(correct) {
        const answer = document.getElementById("answer-" + this.sentAnswer);
        answer.style = correct == 1 ? "background-color: #00ff9d" : "background-color: #ff003c;";
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
            <p><b class="name" style="padding-right: 5px; color: ${color != null ? color : "white"}">${name}:</b> ${message}</p>
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
            window.core.audio.buttonClick.play();
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
        this.players.forEach(({ color, nickname, rank }) => {
            this.lobby.innerHTML += `<div class="player"><b style="color: #8C9399; margin-right: 15px;"><span style="color: ${color}; margin-left: 5px;">[${rank}]</span></b><b> ${nickname.toUpperCase()}</b></div>`;
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

    renderServers(servers) {
        const serverList = document.querySelector("#serverList .servers")
        serverList.innerHTML = "";

        servers.forEach(({ port, players }, index) => {
            serverList.innerHTML += `
            <div id="server-${index}" ip="ws://localhost:${port}" class="server">
                <div class="players">${players}/10</div>
                <div class="box">
                    <h1>Trivia</h1>
                </div>
            <h1 id="join">JOIN</h1>
        </div>`
        });

        const serverL = document.querySelectorAll(".server #join")

        for (let server of serverL) {
            server.onclick = (data) => {
                let ip = data.target.parentElement.getAttribute("ip");
                this.socket = new GameSocket(this, ip);
                window.core.audio.buttonClick.play();
            }
        }
    }

    getProfile() {
        return `<div class="container" id="profile">
        <div class="header">
            <div class="side">
                <img id="profileImg" src="https://image.freepik.com/free-vector/flying-slice-pizza-cartoon-vector-illustration-fast-food-concept-isolated-vector-flat-cartoon-style_138676-1934.jpg"/>
                <div class="text">
                    <h1>Exper</h1>
                    <b>Level: <span style="color: #00FF9D;">9</span></b>
                </div>
            </div>
        </div>
        <div class="bottom">
            <div class="buttons">
                <div class="button">Shop</div>
                <div class="button">Stats</div>
                <div class="button">...</div>
                <div class="button">...</div>
            </div>
        </div>
    </div>`;
    }

    loadLobbyMenu() {
        const menu = document.getElementById("menu");

        menu.outerHTML = `
        <div id="fade"></div>
        <div id="menu">
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
        </div>
        `;
    }

    resetLobby() {
        this.lobby = document.querySelector(".lobby");

        if (this.socket != null) {
            this.lobby.innerHTML = "";
        }
    }
}