const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let User = new Schema({
  username: String,
  ip: String,
});

const model = mongoose.model("users", User);

module.exports = model;