const Packets = require("../../packets/packets");
const config = require('config');

module.exports = class {
    constructor(gameserver) {
        this.gameServer = gameserver;

        this.drawings = [
            "Cat", 
            "Dog", 
            "Tree",
            "Car",
            "Bow",
            "Wizard",
            "Fan",
            "Keyboard",
            "Guitar",
            "Bongos",
        ]

        this.bannedWords = ["fuck", "ass", "wank", "cunt", "twat"];

        this.playersCorrect = []

        this.awaitingCatagory = true;

        this.timer = null;
        this.pickedCatagory = null;
        this.playerAskedToPickCatagory = null;
        this.isChanging = false;

        this.gameMax = 10;
        this.gameIndex = 0;

        this.playerIndex = 0;
        this.roundTimer = config.get("gamemode.skribbl.Timer.roundTimer");
    }

    onGameStart() {
        this.sendOutCatagory();
    }

    reset() {
        this.playersCorrect = []
        this.awaitingCatagory = true;
        this.pickedCatagory = null;
        this.playerAskedToPickCatagory = null;
        this.isChanging = false;
    }

    resetBoard(player) {
        if (this.playerAskedToPickCatagory && this.playerAskedToPickCatagory.id == player.id) {
            this.gameServer.broadcast(new Packets.ResetBoard());
        }
    }

    sendOutCatagory() {
        const players = this.gameServer.players;
        const randomPlayer = players[this.playerIndex];
        const drawings = this.drawings.sort(() => Math.random() - Math.random()).slice(0, 3);

        this.playerAskedToPickCatagory = randomPlayer;

        randomPlayer.sendPacket(new Packets.Catagory(drawings));
        
        // Filter through the players that are not picked and send them the awaiting
        // screen so that they know whats happening

        players.filter(player => player.id != randomPlayer.id).forEach((player) => {
            player.sendPacket(new Packets.AwaitingCatagory());
        });
    }

    onChatMessage(player, msg) {
        msg = msg.split("\u0000").join("")

        if (msg.length == 0 || msg.length > 30) return;
        if (player.id == this.playerAskedToPickCatagory.id) return;

        if (this.bannedWords.some(v => msg.toLowerCase().includes(v.toLowerCase()))) {
            return player.sendPacket(new Packets.ChatMessage("[SERVER]", `Message contains a banned word!`, "hsl(0deg 100% 69%)"));
        }

        if (msg.toLowerCase() == this.pickedCatagory.toLowerCase()) {
            if (!this.playersCorrect.find(p => p.id == player.id)) {
                this.playersCorrect.push(player);
            }

            player.score += 20;

            let players = this.playersCorrect.length + "/" + (this.gameServer.players.length - 1);

            if (this.playersCorrect.length == this.gameServer.players.length - 1) {
                this.gameServer.broadcast(new Packets.ChatMessage("[SERVER]", `Everybody got the correct word`, "rgb(133 109 255)"));
                this.isChanging = true;

                this.playerIndex++;

                if (this.playerIndex == this.gameServer.players.length) {

                    this.gameIndex++;
                    this.checkGameIndex();

                } else {
                    setTimeout(() => {
                        this.reset();
                        this.sendOutCatagory();
                    }, config.get("gamemode.skribbl.Timer.newRound"));
                }
            } else {
                player.sendPacket(new Packets.ChatMessage("[SERVER]", `You guessed the correct word! Waiting for the others. [${players}]`, "rgb(133 109 255)"))
            }
        } else {
            this.gameServer.broadcast(new Packets.ChatMessage(player.nickname, msg, player.color));
        }
    }

    onPickedCatagory(player, catagory) {
        // If the game is awaiting a catagory whilst picked then
        // check if that player is the same as the random one
        // picked if so then assign the variables with the right data
        // and call the function to start the game
        
        if (this.awaitingCatagory) {
            if (player.id == this.playerAskedToPickCatagory.id) {
                this.pickedCatagory = this.drawings[catagory];
                this.awaitingCatagory = false;
                this.newGame();
            }
        }
    }

    checkGameIndex() {
        if (this.gameIndex == this.gameMax) {
            this.gameServer.broadcast(new Packets.ChatMessage("[SERVER]", `Game is ending!`, "rgb(133 109 255)"))

            setTimeout(() => {
                this.gameServer.broadcast(new Packets.LeaderBoard(this.gameServer.players));
                this.gameServer.broadcast(new Packets.GameEnded());

                setTimeout(() => {
                    this.gameServer.broadcast(new Packets.EndGame())
                    this.gameServer.resetLobby();
                }, config.get("gamemode.skribbl.Timer.endGame"));
            }, config.get("gamemode.skribbl.Timer.endGameLeaderboard"));
        } else {
            this.gameServer.broadcast(new Packets.ChatMessage("[SERVER]", `New round [${this.gameIndex}/${this.gameMax}]`, "rgb(133 109 255)"))
            this.playerIndex = 0;

            setTimeout(() => {
                this.reset();
                this.sendOutCatagory();
            }, config.get("gamemode.skribbl.Timer.newRound"));
        }
    }

    newGame() {
        clearInterval(this.timer);

        const letters = this.pickedCatagory.split("").map(s => s = "_ ").join("");

        this.gameServer.broadcast(new Packets.ResetScreen());
        this.gameServer.broadcast(new Packets.LeaderBoard(this.gameServer.players));

        this.gameServer.players.filter(player => player.id != this.playerAskedToPickCatagory.id).forEach((player) => {
            player.sendPacket(new Packets.ChatMessage("[SERVER]", `The word to guess is: ${letters}`, "rgb(133 109 255)"));
        });
        
        this.playerAskedToPickCatagory.sendPacket(new Packets.ChatMessage("[SERVER]", "The word to draw is: " + this.pickedCatagory, "rgb(133 109 255)"))

        let time = this.roundTimer;

        this.gameServer.broadcast(new Packets.RoundTimer(time));

        this.timer = setInterval(() => {
            time--;

            this.gameServer.broadcast(new Packets.RoundTimer(time));

            if (time == 0) {
                time = this.roundTimer;
                clearInterval(this.timer);
                setTimeout(() => {
                    if (!this.isChanging) {
                        this.gameServer.broadcast(new Packets.LeaderBoard(this.gameServer.players));
                        
                        this.playerIndex++;

                        if (this.playerIndex == this.gameServer.players.length) {

                            this.gameIndex++;
                            this.checkGameIndex();
        
                        } else {
                            this.gameServer.broadcast(new Packets.ChatMessage("[SERVER]", "The word was: " + this.pickedCatagory, "rgb(133 109 255)"))
                            
                            setTimeout(() => {
                                this.reset();
                                this.sendOutCatagory();
                            }, config.get("gamemode.skribbl.Timer.newRound"));
                        }
                    }
                }, 500)
            };
        }, 1000);
    }

    onDraw(player, x1, y1, x2, y2) {
        if (player.id == this.playerAskedToPickCatagory.id) {
            this.gameServer.broadcast(new Packets.DrawPixel([x1, y1], [x2, y2]));
        }
    }
}