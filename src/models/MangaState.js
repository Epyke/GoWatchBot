const { Schema, model } = require("mongoose");

const mangaStateSchema = new Schema({
  anilistId: { type: Number, required: true, unique: true },
  lastChapter: { type: Number, default: 0 },
});

module.exports = model("MangaState", mangaStateSchema);
