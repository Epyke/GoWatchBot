const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: {
    name: "ping",
    description: "Replies with the bot latency.",
  },

  run: async ({ interaction, client }) => {
    await interaction.reply(`Pong! Latency is ${client.ws.ping}ms.`);
  },

  options: {
    userPermissions: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.SendMessages],
  },
};
