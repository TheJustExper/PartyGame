import Leaderboard from "../../../../server/packets/LeaderBoard";

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
            case 1:
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
            case 2:
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
                    this.core.menus.loadMenu(2);
                    // this.core.audio.music.pause()
                }
                break;
            case 3:
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
            case 4:
                window.location.reload();
                break;
            case 5:
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
            case 6:
                const answer = data.getUint8(offset);
                offset += 1;

                this.core.roundEndResult(answer);
            case 7:
                const colorLength = data.getUint8(offset);
                offset += 1;

                const color = data.getString(offset, colorLength);
                offset += colorLength;

                this.core.addPlayerVoted(color);
                break;
            case 8:
                this.core.onGameEnd();
                break;
            case 9:
                const timer = data.getUint8(offset);
                offset += 1;

                this.core.setRoundTimer(timer);
                break;
            case 10:
                const usernameLength = data.getUint8(offset);
                offset += 1;
                const username = data.getString(offset, usernameLength);
                offset += usernameLength;

                const messageLength = data.getUint8(offset);
                offset += 1;
                const message = data.getString(offset, messageLength);
                offset += messageLength;

                this.core.addMessage(username, message);
                break;
            case 11:
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
            case 12:
                this.core.onAwaitingCatagory();
                break;
        }
    }
}