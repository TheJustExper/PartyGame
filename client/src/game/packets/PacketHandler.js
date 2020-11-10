import Packets from "./Packets";

export default class {
    constructor(core) {
        this.core = core;
        this.inCountdown = false;
    }

    handlePacket(game) {
        const { opcode, data } = msgpack.decode(new Uint8Array(game.data));

        switch (opcode) {
            case 0:
                const { type } = data;
                this.core.gameType = type;
                this.core.gamemode = this.core.gamemodes[type];
                break;
            case Packets.PlayerList:
                this.core.socket.onceUsernameIsSent();
                this.core.resetLobby();
                
                var { players } = data;

                this.core.setPlayers(players);
                break;
            case Packets.StartGame:
                const state = document.getElementById("state");
                var { timer } = data;

                state.innerText = `${timer} seconds remaining`

                if (!this.inCountdown) {
                    this.inCountdown = true;
                }

                if (timer == 0) {
                    this.core.state = "INGAME";
                    this.core.menus.loadMenu(this.core.gameType);
                }
                break;
            case Packets.Leaderboard:
                var { players } = data;
                this.core.setLeaderboard(players);
                break;
            case Packets.EndGame:
                window.location.reload();
                break;
            case Packets.Question:
                var { question, answers } = data;

                let d = {
                    question,
                    answers,
                }
            
                this.core.trivia = d;
                this.core.sentAnswer = null;
                this.core.resetVoters();
                this.core.showQuestion(d);
                break;
            case Packets.RoundEnd:
                var { answer } = data;

                this.core.roundEndResult(answer);
            case Packets.Voter:
                var { color } = data;

                if (color != undefined) this.core.addPlayerVoted(color);
                break;
            case Packets.GameEnded:
                this.core.onGameEnd();
                break;
            case Packets.RoundTimer:
                var { timer } = data;

                this.core.gamemode.setRoundTimer(timer);
                break;
            case Packets.ChatMessage:
                var { username, message, color } = data;

                this.core.addMessage(color, username, message);
                break;
            case Packets.Catagory:
                var { catagories } = data;

                this.core.onCatagories(catagories);
                break;
            case Packets.AwaitingCatagory:
                this.core.onAwaitingCatagory();
                break;
            case Packets.ResetScreen:
                this.core.resetScreen();
                break;
            case Packets.DrawPixel:
                const [ x1, y1, x2, y2 ] = data.position;

                this.core.gamemode.drawFromServer(x1, y1, x2, y2);
                break;
            case Packets.ResetBoard:
                this.core.gamemode.resetBoard();
                break;
            case Packets.AccountInfo:
                var { username } = data;
                break;
        }
    }
}