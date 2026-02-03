const { Client, Interaction, MessageFlags } = require("discord.js");

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 * @returns
 */
module.exports = async (client, interaction) => {
  if (!interaction.isMessageContextMenuCommand()) return;

  if (interaction.commandName === "Translate message") {
    const targetMessageContent = interaction.targetMessage.content;

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const result = await client.deepl.translateText(
        targetMessageContent,
        null,
        "en-GB",
      );

      await interaction.editReply(
        `**Original:** ${targetMessageContent}\n**Translated:** ${result.text}`,
      );
    } catch (error) {
      console.error(error);
      await interaction.editReply("Failed to translate the message.");
    }
  }
};
