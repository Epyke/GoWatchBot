const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const NotificationConfig = require("../../../models/NotificationConfig");

module.exports = {
  data: {
    name: "notification-set",
    description: "Set a channel for anime notifications.",
    options: [
      {
        name: "channel",
        description: "The channel to send notifications to.",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
        required: true,
      },
    ],
  },

  run: async ({ interaction }) => {
    const channelId = interaction.options.get("channel").value;

    try {
      await interaction.deferReply({ ephemeral: true });

      let config = await NotificationConfig.findOne({
        guildId: interaction.guildId,
      });

      if (config) {
        config.channelId = channelId;
      } else {
        config = new NotificationConfig({
          guildId: interaction.guildId,
          channelId: channelId,
        });
      }

      await config.save();
      interaction.editReply(
        `Notifications will now be sent to <#${channelId}>.`,
      );
    } catch (error) {
      console.log(error);
    }
  },

  options: {
    userPermissions: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.SendMessages],
  },
};
