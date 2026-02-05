const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  data: {
    name: "timeout",
    description: "Timeout a user.",
    options: [
      {
        name: "target-user",
        description: "The user you want to timeout.",
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
      {
        name: "duration",
        description: "Timeout duration (30m, 1h, 1 day).",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "reason",
        description: "The reason for the timeout.",
        type: ApplicationCommandOptionType.String,
      },
    ],
  },

  run: async ({ interaction }) => {
    const targetUserId = interaction.options.get("target-user").value;
    const duration = interaction.options.get("duration").value;
    const reason =
      interaction.options.get("reason")?.value || "No reason provided";

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);
    if (!targetUser) {
      return interaction.editReply("That user doesn't exist in this server.");
    }

    if (targetUser.user.bot) {
      return interaction.editReply("I can't timeout a bot.");
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      return interaction.editReply("Please provide a valid timeout duration.");
    }

    if (msDuration < 5000 || msDuration > 2.419e9) {
      return interaction.editReply(
        "Timeout duration cannot be less than 5 seconds or more than 28 days.",
      );
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      return interaction.editReply(
        "You can't timeout that user because they have the same/higher role than you.",
      );
    }

    if (targetUserRolePosition >= botRolePosition) {
      return interaction.editReply(
        "I can't timeout that user because they have the same/higher role than me.",
      );
    }

    try {
      const { exclamation } = targetUser.communicationDisabledUntilTimestamp
        ? { exclamation: "updated" }
        : { exclamation: "timed out" };
      await targetUser.timeout(msDuration, reason);
      await interaction.editReply(
        `${targetUser} was ${exclamation} for ${duration}.\nReason: ${reason}`,
      );
    } catch (error) {
      console.log(`There was an error when timing out: ${error}`);
    }
  },

  options: {
    userPermissions: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.ModerateMembers],
  },
};
