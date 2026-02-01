require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
  {
    name: "ping",
    description: "Répond pong",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log("Enregistrement des commandes avec slash");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      { body: commands },
    );

    console.log("Les commandes avec slash ont éte enregistré avec succès");
  } catch (error) {
    console.error(error);
  }
})();
