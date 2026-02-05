const { Client, Interaction } = require("discord.js");

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 * @returns
 */
module.exports = async (interaction, client) => {
  if (!interaction.isUserContextMenuCommand()) return;

  if (interaction.commandName === "User Information") {
    const targetUser = interaction.targetUser;

    interaction.reply(
      `Username: ${targetUser.username}\nID: ${targetUser.id}\nUser Tag: ${targetUser.tag}`,
    );
  }
};
