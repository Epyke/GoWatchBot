const { PermissionFlagsBits } = require("discord.js");
const NotificationConfig = require("../../../models/NotificationConfig");

module.exports = {
  data: {
    name: "notification-remove",
    description: "Disable anime notifications for this server.",
  },

  run: async ({ interaction }) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      const deletedConfig = await NotificationConfig.findOneAndDelete({
        guildId: interaction.guildId,
      });

      if (!deletedConfig) {
        return interaction.editReply(
          "Notifications are not configured for this server.",
        );
      }

      interaction.editReply("Anime notifications have been disabled.");
    } catch (error) {
      console.log(error);
    }
  },

  options: {
    userPermissions: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.SendMessages],
  },
};
