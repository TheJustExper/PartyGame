import Packets from "./Packets";

export default class {
    constructor(core) {
        this.core = core;
        this.inCountdown = false;
    }

    handlePacket(game) {
        const data = new DataView(game.data);
        var offset = 0;
        const opcode = data.getUint8(offset++);

        switch (opcode) {
            case 0:
                const gameType = data.getUint8(offset);
                this.core.gameType = gameType;
                this.core.gamemode = this.core.gamemodes[gameType];
                break;
            case Packets.PlayerList:
                this.core.socket.onceUsernameIsSent();
                this.core.resetLobby();
                
                var playersList = []
                var players = data.getUint8(offset);
                offset += 1;

                for (let i = 0; i < players; i++) {
                    const id = data.getUint8(offset);
                    offset += 1;

                    const length = data.getUint8(offset);
                    offset += 1;

                    const name = data.getString(offset, length);
                    offset += length;  

                    playersList.push({ id, name });
                }

                this.core.setPlayers(playersList);
                break;
            case Packets.StartGame:
                const state = document.getElementById("state");
                const time = data.getUint8(offset);

                state.innerText = `${time} seconds remaining`

                if (!this.inCountdown) {
                    this.inCountdown = true;
                    // this.core.audio.music.volume = 0.1;
                    // this.core.audio.music.play();
                }

                if (time == 0) {
                    this.core.state = "INGAME";
                    this.core.menus.loadMenu(this.core.gameType);
                    // this.core.audio.music.pause()
                }
                break;
            case Packets.Leaderboard:
                let leaderboard = []
                var players = data.getUint8(offset);
                offset += 1;

                for (let i = 0; i < players; i++) {
                    const points = data.getUint8(offset);
                    offset += 1;

                    const length = data.getUint8(offset);
                    offset += 1;

                    const name = data.getString(offset, length);
                    offset += length;  

                    const colorlength = data.getUint8(offset);
                    offset += 1;

                    const color = data.getString(offset, colorlength);
                    offset += colorlength;  
                    

                    leaderboard.push({ name, points, color })
                }

                this.core.setLeaderboard(leaderboard);
                break;
            case Packets.EndGame:
                window.location.reload();
                break;
            case Packets.Question:
                let question = {
                    question: "",
                    answers: []
                }
                const questionLength = data.getUint8(offset);
                offset += 1;
                const questionString = data.getString(offset, questionLength);
                offset += questionLength;
                const amounOfAnswers = data.getUint8(offset);
                offset += 1;

                question.question = questionString;

                for (let i = 0; i < amounOfAnswers; i++) {
                    const answerLength = data.getUint8(offset);
                    offset += 1;
                    const answer = data.getString(offset, answerLength);
                    offset += answerLength;
                    question.answers.push(answer);
                }

                this.core.trivia = question;
                this.core.sentAnswer = null;
                this.core.resetVoters();
                this.core.showQuestion(question);
                break;
            case Packets.RoundEnd:
                const answer = data.getUint8(offset);
                offset += 1;

                this.core.roundEndResult(answer);
            case Packets.Voter:
                var colorLength = data.getUint8(offset);
                offset += 1;

                var color = data.getString(offset, colorLength);
                offset += colorLength;

                this.core.addPlayerVoted(color);
                break;
            case Packets.GameEnded:
                this.core.onGameEnd();
                break;
            case Packets.RoundTimer:
                const timer = data.getUint8(offset);
                offset += 1;

                this.core.gamemode.setRoundTimer(timer);
                break;
            case Packets.ChatMessage:
                const usernameLength = data.getUint8(offset);
                offset += 1;
                const username = data.getString(offset, usernameLength);
                offset += usernameLength;

                const messageLength = data.getUint8(offset);
                offset += 1;
                const message = data.getString(offset, messageLength);
                offset += messageLength;

                var colorLength = data.getUint8(offset);
                offset += 1;
                var color = data.getString(offset, colorLength);
                offset += colorLength;

                this.core.addMessage(color, username, message);
                break;
            case Packets.Catagory:
                let catagories = []
                const catagorieAmount = data.getUint8(offset);
                offset += 1;

                for (let i = 0; i < catagorieAmount; i++) {
                    const catagoryLength = data.getUint8(offset);
                    offset += 1;

                    const catagory = data.getString(offset, catagoryLength);
                    offset += catagoryLength;

                    catagories.push(catagory);
                }

                this.core.onCatagories(catagories);
                break;
            case Packets.AwaitingCatagory:
                this.core.onAwaitingCatagory();
                break;
            case Packets.ResetScreen:
                this.core.resetScreen();
                break;
            case Packets.DrawPixel:
                const x1 = data.getUint16(offset);
                offset += 2;
                const y1 = data.getUint16(offset);
                offset += 2;
                const x2 = data.getUint16(offset);
                offset += 2;
                const y2 = data.getUint16(offset);
                offset += 2; 

                this.core.gamemode.drawFromServer(x1, y1, x2, y2);
                break;
            case Packets.ResetBoard:
                this.core.gamemode.resetBoard();
                break;
        }
    }
}