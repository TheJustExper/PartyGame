const Packets = require("../../packets/packets");
const config = require('config');

module.exports = class {
    constructor(gameserver) {
        this.gameServer = gameserver;

        this.catagories = ["History", "Public Knowledge"];
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
            ],
            [
                {
                    question: "Are you a twat?",
                    answers: ["True", "False"],
                    correctAnswer: 0
                }
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


        // Send the catagory list to a random player picked

        randomPlayer.sendPacket(new Packets.Catagory(this.catagories));
        
        // Filter through the players that are not picked and send them the awaiting
        // screen so that they know whats happening

        players.filter(player => player.id != randomPlayer.id).forEach((player) => {
            player.sendPacket(new Packets.AwaitingCatagory());
        });
    }

    onPickedCatagory(player, catagory) {
        // If the game is awaiting a catagory whilst picked then
        // check if that player is the same as the random one
        // picked if so then assign the variables with the right data
        // and call the function to start the game
        
        if (this.awaitingCatagory) {
            if (player.id == this.playerAskedToPickCatagory.id) {
                this.pickedCatagory = catagory;
                this.awaitingCatagory = false;
                this.newGame();
            }
        }
    }

    newGame() {
        this.gameServer.broadcast(new Packets.ResetScreen());
        this.gameServer.broadcast(new Packets.LeaderBoard(this.gameServer.players));
        
        clearInterval(this.timer);

        let question = this.getRandomQuestion();
        let time = this.roundTimer;

        let catagory = this.catagory[this.pickedCatagory];
        catagory.splice(catagory.findIndex(quest => quest.question == question.question), 1);

        this.question = question;
        this.roundAnswered = []
        this.roundMax = catagory.length - 1;
        this.isChanging = false;

        this.gameServer.broadcast(new Packets.Question(question));
        this.gameServer.broadcast(new Packets.RoundTimer(time));

        this.timer = setInterval(() => {
            time--;

            this.gameServer.broadcast(new Packets.RoundTimer(time));

            if (time == 0) {
                time = this.roundTimer;
                clearInterval(this.timer);
                setTimeout(() => {
                    if (!this.isChanging) {
                        this.checkRounds();
                    }
                }, 500)
            };
        }, 1000);
    }

    onAnswer(play, answer) {

        /*
            This nonsense gives players points if they chose the correct
            answer then pushes them into a answer array then broadcasts
            the voter color so that they know who has voted. Then what 
            happens is the game recieves all votes and does some timer
            shit so that the functions dont run quick as balls n stuff.
        */

        if (!this.roundAnswered.find(p => p.player == play.id)) {
            if (this.question.correctAnswer == answer) play.score += 20;

            let value = { player: play, isRight: this.question.correctAnswer == answer, question: this.question }
            this.roundAnswered.push(value);

            this.gameServer.broadcast(new Packets.Voter(play.color));

            if (this.roundAnswered.length == this.gameServer.players.length) {
                console.log("All players voted! Sending results...");
                this.isChanging = true;

                setTimeout(() => {
                    this.gameServer.players.forEach(player => {
                        let ans = this.roundAnswered.find(p => p.player.id == player.id).isRight ? 1 : 0;
                        player.sendPacket(new Packets.RoundEnd(ans));
                    });
    
                    setTimeout(() => {
                        this.checkRounds();
                    }, config.get("gamemode.trivia.Timer.roundEnd"));
                }, config.get("gamemode.trivia.Timer.recieveAnswers"));
            }
        }
    }

    checkRounds() {
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
    }

    sendNewRound() {}
}