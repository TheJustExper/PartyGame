const Packets = require("../../packets/packets");
const config = require('config');

module.exports = class {
    constructor(gameserver) {
        this.gameServer = gameserver;

        this.catagories = ["History"];
        this.catagory = [
            [
                {
                    question: "In which year did the battle of Hastings take place?",
                    answers: ["1066", "1700", "1451", "1123"],
                    correctAnswer: 0
                },
                {
                    question: "In which year did Magzi win Rocket League?",
                    answers: ["1066", "1700"],
                    correctAnswer: 0
                },
                {
                    question: "Which U.S. naval base was attacked by the Japanese on December 7, 1941?",
                    answers: ["Pearl Ship", "Pearl Harbour", "Shit Harbour"],
                    correctAnswer: 1
                },
                {
                    question: "Who was Henry VIII's last wife?",
                    answers: ["Bob Bob", "Catherine Purr", "Catherine Parr"],
                    correctAnswer: 2
                },
                {
                    question: "What was the name of the cloned sheep created in 1996?",
                    answers: ["Dolly", "Polly", "Barry"],
                    correctAnswer: 0
                },
                {
                    question: "Who was Queen Victoria's husband?",
                    answers: ["Prince Paul", "Prince John", "Prince Albert"],
                    correctAnswer: 2
                },
                {
                    question: "For how many years did the Vietnam War last?",
                    answers: ["12", "16", "19"],
                    correctAnswer: 2
                },
                {
                    question: "The Great Fire of London took place in which year?",
                    answers: ["1203", "1666", "1320"],
                    correctAnswer: 1
                },
                {
                    question: "Which planet was discovered in 1846?",
                    answers: ["Neptune", "Mars", "Earth"],
                    correctAnswer: 0
                },
                {
                    question: "In what year did the Chernobyl disaster occur?",
                    answers: ["1923", "2003", "1745", "1986"],
                    correctAnswer: 3
                },
                {
                    question: "Which country has the most natural lakes?",
                    answers: ["America", "England", "Canada"],
                    correctAnswer: 2
                },
                {
                    question: "What is the most populated country in Africa?",
                    answers: ["Nigeria", "Botswana", "Scotland"],
                    correctAnswer: 0
                },
                {
                    question: "Who was the 44th President of the USA?",
                    answers: ["Barack Osama", "Osama Osama", "Barack Obama"],
                    correctAnswer: 2
                },
                {
                    question: "What is the capital of Pakistan?",
                    answers: ["Islamabad", "Islamasad", "Islamapan"],
                    correctAnswer: 0
                },
            ]
        ]

        this.question = {}
        
        this.roundsPlayed = 0;
        this.roundsMax = 0;

        this.playerAskedToPickCatagory = null;
        this.pickedCatagory = 0;
        this.awaitingCatagory = true;
        this.isChanging = false;
    
        this.roundAnswered = []

        this.gameType = "NORMAL";

        this.roundTimer = 10;
        this.timer = null;
    }

    reset() {
        clearInterval(this.timer);
        this.question = {}
        this.roundsPlayed = 0;
        this.timer = null;
    }

    getRandomQuestion() {
        const random = Math.floor(Math.random() * this.catagory[this.pickedCatagory].length);
        const randomQuestion = this.catagory[this.pickedCatagory][random];
        return randomQuestion;
    }

    onGameStart() {
        const players = this.gameServer.players;
        const random = Math.floor(Math.random() * players.length);
        const randomPlayer = players[random];
        
        this.playerAskedToPickCatagory = randomPlayer;

        randomPlayer.sendPacket(new Packets.SendCatagory(this.catagories));

        players.filter(player => player.id != randomPlayer.id).forEach((player) => {
            player.sendPacket(new Packets.AwaitingCatagory());
        });
    }

    onPickedCatagory(player, catagory) {
        if (this.awaitingCatagory) {
            if (player.id == this.playerAskedToPickCatagory.id) {
                this.pickedCatagory = catagory;
                this.awaitingCatagory = false;
                this.newGame();
            }
        }
    }

    newGame() {
        clearInterval(this.timer);

        let question = this.getRandomQuestion();
        let time = this.roundTimer;

        let catagory = this.catagory[this.pickedCatagory];
        catagory.splice(catagory.findIndex(quest => quest.question == question.question), 1);

        this.question = question;
        this.roundAnswered = []
        this.roundMax = 1;
        this.isChanging = false;

        this.gameServer.broadcast(new Packets.SendQuestion(question));
        this.gameServer.broadcast(new Packets.RoundTimer(time));

        this.timer = setInterval(() => {
            time--;

            this.gameServer.broadcast(new Packets.RoundTimer(time));

            if (time == 0) {
                time = this.roundTimer;
                if (!this.isChanging) {
                    this.gameServer.broadcast(new Packets.LeaderBoard(this.gameServer.players));
                    this.newGame()
                }
            };
        }, 1000);
    }

    onAnswer(play, answer) {
        console.log("Player: " + play.id + " answered: " + answer);

        if (!this.roundAnswered.find(p => p.player == play.id)) {
            if (this.question.correctAnswer == answer) play.score += 20;

            let value = { player: play, isRight: this.question.correctAnswer == answer, question: this.question }
            this.roundAnswered.push(value);

            this.gameServer.broadcast(new Packets.SendVoter(play.color));

            if (this.roundAnswered.length == this.gameServer.players.length) {
                console.log("All players voted! Sending results...");
                this.isChanging = true;

                setTimeout(() => {
                    this.gameServer.players.forEach(player => {
                        let ans = this.roundAnswered.find(p => p.player.id == player.id).isRight ? 1 : 0;
                        player.sendPacket(new Packets.RoundEnd(ans));
                    });
    
                    setTimeout(() => {
                        if (this.roundsPlayed < this.roundsMax) {
                            this.roundsPlayed++;
                            this.newGame();
                            this.gameServer.broadcast(new Packets.LeaderBoard(this.gameServer.players));
                        } else {
                            this.gameServer.broadcast(new Packets.LeaderBoard(this.gameServer.players));
                            this.gameServer.broadcast(new Packets.GameEnded());
                            setTimeout(() => {
                                this.gameServer.broadcast(new Packets.EndGame())
                                this.gameServer.resetLobby();
                                this.reset();
                            }, config.get("gamemode.trivia.Timer.gameEnd"));
                        }
                    }, config.get("gamemode.trivia.Timer.roundEnd"));
                }, config.get("gamemode.trivia.Timer.recieveAnswers"));
            }
        }
    }

    sendNewRound() {}
}