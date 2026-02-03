const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  REST,
  Routes,
} = require("discord.js");

const commandsData = [
  new ContextMenuCommandBuilder()
    .setName("User Information")
    .setType(ApplicationCommandType.User)
    .toJSON(),

  new ContextMenuCommandBuilder()
    .setName("Translate message")
    .setType(ApplicationCommandType.Message)
    .toJSON(),
];

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log("Refreshing context menu commands...");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commandsData,
    });

    console.log("Successfully registered context menu commands");
  } catch (error) {
    console.error(
      `Il y a une erreur avec les commandes dans le menu context: ${error}`,
    );
  }
})();
