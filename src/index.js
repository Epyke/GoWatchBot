require("dotenv").config();
const { Client, IntentsBitField, Partials } = require("discord.js");
const mongoose = require("mongoose");
const deepl = require("deepl-node");
const { CommandKit } = require("commandkit");

const client = new Client({
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction,
  ],
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
  ],
});

(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MANGODB_URI);
    client.deepl = new deepl.Translator(process.env.DEEPL_TOKEN);
    console.log("Connecté a la base de donné");

    new CommandKit({
      client,
      eventsPath: `${__dirname}/events`,
      commandsPath: `${__dirname}/commands`,
      bulkRegister: true,
    });

    client.login(process.env.BOT_TOKEN);
  } catch (error) {
    console.error(error);
  }
})();
