const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  malUsername: { type: String },
  subscribedAnime: [Number],
});

module.exports = model("User", userSchema);
