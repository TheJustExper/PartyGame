const BinaryWriter = require("../utils/BinaryWriter");

function SendQuestion(question) {
    this.question = question;
}

module.exports = SendQuestion;

SendQuestion.prototype.build = function () {
    const writer = new BinaryWriter();
    writer.writeUInt8(5);
    writer.writeUInt8(this.question.question.length);
    writer.writeStringUtf8(this.question.question)
    writer.writeUInt8(this.question.answers.length);

    this.question.answers.forEach(question => {
        writer.writeUInt8(question.length);
        writer.writeStringUtf8(question);
    });

    return writer.toBuffer();
};
