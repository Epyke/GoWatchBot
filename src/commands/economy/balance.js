const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");
const User = require("../../models/User");

module.exports = {
  data: {
    name: "balance",
    description: "Check your or someone else's balance.",
    options: [
      {
        name: "user",
        description: "The user to check the balance of.",
        type: ApplicationCommandOptionType.User,
      },
    ],
  },

  run: async ({ interaction }) => {
    const targetUser = interaction.options.getUser("user") || interaction.user;

    await interaction.deferReply();

    const user = await User.findOne({
      userId: targetUser.id,
      guildId: interaction.guildId,
    });

    if (!user) {
      return interaction.editReply(
        `${targetUser.username} doesn't have a balance yet.`,
      );
    }

    interaction.editReply(
      `${targetUser.username}'s balance is **${user.balance}** coins.`,
    );
  },

  options: {
    userPermissions: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.SendMessages],
  },
};
