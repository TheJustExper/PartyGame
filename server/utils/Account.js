const bcrypt = require("bcrypt");

module.exports = {
    async genPassword(password) {
        const saltRounds = 10;
        var password = await bcrypt.hash(password, saltRounds);

        return password;
    }
}