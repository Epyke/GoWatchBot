require("dotenv").config();
const { Client, IntentsBitField, ActivityType } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const mongoose = require("mongoose");
const deepl = require("deepl-node");
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MANGODB_URI);
    client.deepl = new deepl.Translator(process.env.DEEPL_TOKEN);
    console.log("Connecté a la base de donné");

    eventHandler(client);

    client.login(process.env.BOT_TOKEN);
  } catch (error) {
    console.error(error);
  }
})();
