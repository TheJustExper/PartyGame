const msgpack = require("msgpack-lite");

function RoundEnd(answer) {
    this.answer = answer;
}

module.exports = RoundEnd;

RoundEnd.prototype.build = function () {
    const buf = msgpack.encode({
        opcode: 6,
        data: {
            answer: this.answer
        }
    });

    return buf;
};
