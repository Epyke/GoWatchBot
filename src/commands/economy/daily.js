const { PermissionFlagsBits } = require("discord.js");
const User = require("../../models/User");

const dailyAmount = 1500; // Updated to match your snippet

module.exports = {
  data: {
    name: "daily",
    description: "Claim your daily reward.",
  },

  run: async ({ interaction }) => {
    await interaction.deferReply();

    let user = await User.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });

    if (user) {
      const lastDaily = user.lastDaily;
      const now = new Date();

      if (lastDaily && now - lastDaily < 86400000) {
        return interaction.editReply(
          "You have already claimed your daily reward today!",
        );
      }

      user.balance += dailyAmount;
      user.lastDaily = now;
      await user.save();
    } else {
      user = new User({
        userId: interaction.user.id,
        guildId: interaction.guildId,
        balance: dailyAmount,
        lastDaily: new Date(),
      });
      await user.save();
    }

    interaction.editReply(
      `You have claimed **${dailyAmount}** coins! Your new balance is **${user.balance}** coins.`,
    );
  },

  options: {
    userPermissions: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.SendMessages],
  },
};
