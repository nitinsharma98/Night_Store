const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  themeColor: { type: String, default: "#00FFAA" }
});

module.exports = mongoose.model("User", userSchema);
