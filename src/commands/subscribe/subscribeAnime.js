const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("subscribe-anime") // Fixed: Must be lowercase
    .setDescription("Subscribe to an anime for notifications.")
    .addStringOption(
      (option) =>
        option
          .setName("anime")
          .setDescription("The name of the anime to subscribe to.")
          .setRequired(true)
          .setAutocomplete(true), // Keeps your autocomplete functionality
    ),

  run: async ({ interaction }) => {
    const animeName = interaction.options.getString("anime");

    // Add your subscription logic here (e.g., saving to MongoDB)
    // For now, providing a confirmation message.
    await interaction.reply({
      content: `Successfully subscribed to notifications for: **${animeName}**`,
      ephemeral: true,
    });
  },

  options: {
    userPermissions: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.SendMessages],
  },
};
