const Packets = require("../../packets/packets");
const config = require('config');

module.exports = class {
    constructor(gameserver) {
        this.gameServer = gameserver;

        this.drawings = ["Cat", "Dog", "Tree"]

        this.awaitingCatagory = true;

        this.pickedCatagory = null;
        this.playerAskedToPickCatagory = null;

        this.playerIndex = 0;

        this.playersCorrect = []
    }

    onGameStart() {
        this.sendOutCatagory();
    }

    reset() {
        this.playersCorrect = []
        this.awaitingCatagory = true;
        this.pickedCatagory = null;
        this.playerAskedToPickCatagory = null;
    }

    sendOutCatagory() {
        const players = this.gameServer.players;
        const randomPlayer = players[this.playerIndex];

        this.playerAskedToPickCatagory = randomPlayer;

        randomPlayer.sendPacket(new Packets.Catagory(this.drawings));
        
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

        this.gameServer.broadcast(new Packets.ChatMessage(player.nickname, msg, "white"));

        if (msg.toLowerCase() == this.pickedCatagory.toLowerCase()) {
            if (!this.playersCorrect.find(p => p.id == player.id)) {
                this.playersCorrect.push(player);
            }

            if (this.playersCorrect.length == this.gameServer.players.length - 1) {
                this.gameServer.broadcast(new Packets.ChatMessage("[SERVER]", `Everybody got the correct word`, "rgb(133 109 255)"))

                this.playerIndex++;
                    if (this.playerIndex == this.gameServer.players.length) {
                        this.gameServer.broadcast(new Packets.ChatMessage("[SERVER]", `Game has ended as everyone has drawn!`, "rgb(133 109 255)"))
                        setTimeout(() => this.gameServer.broadcast(new Packets.EndGame()), 3000);
                    }
                }
                
                setTimeout(() => {
                    this.reset();
                    this.sendOutCatagory();
                }, 3000);
            }
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

    newGame() {
        this.gameServer.broadcast(new Packets.ResetScreen());
        this.gameServer.broadcast(new Packets.LeaderBoard(this.gameServer.players));

        this.gameServer.players.filter(player => player.id != this.playerAskedToPickCatagory.id).forEach((player) => {
            player.sendPacket(new Packets.ChatMessage("[SERVER]", "Type a word to guess", "rgb(133 109 255)"));
        });
        
        this.playerAskedToPickCatagory.sendPacket(new Packets.ChatMessage("[SERVER]", "The word to draw is: " + this.pickedCatagory, "rgb(133 109 255)"))
    }

    onDraw(player, x1, y1, x2, y2) {
        if (player.id == this.playerAskedToPickCatagory.id) {
            this.gameServer.broadcast(new Packets.DrawPixel([x1, y1], [x2, y2]));
        }
    }
}