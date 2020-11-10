const msgpack = require("msgpack-lite");

function SendQuestion(question) {
    this.question = question;
}

module.exports = SendQuestion;

SendQuestion.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 5,
        data: {
            question: this.question.question,
            answers: this.question.answers
        }
    });

    return buf;
};
