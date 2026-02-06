const { Schema, model } = require("mongoose");

const userSubscriptionSchema = new Schema({
  discordId: { type: String, required: true, unique: true },
  malUsername: { type: String, required: true },
  trackedAnimeIds: [{ type: Number }],
  trackedMangaIds: [{ type: Number }],
});

module.exports = model("UserSubscription", userSubscriptionSchema);
