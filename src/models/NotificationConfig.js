const mongoose = require("mongoose");

const notificationConfigSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true,
    },
    notificationChannelId: {
      type: String,
      required: true,
    },
    notificationType: {
      type: String,
      required: true,
      enum: ["Anime", "FreeGames", "Movie"],
    },
    lastIdNotified: {
      type: String,
      default: null,
    },
    lastChecked: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

notificationConfigSchema.index(
  { guildId: 1, notificationType: 1 },
  { unique: true },
);

module.exports = mongoose.model("NotificationConfig", notificationConfigSchema);
