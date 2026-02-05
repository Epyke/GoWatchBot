const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: {
    name: "ban",
    description: "Bans a member from the server.",
    options: [
      {
        name: "target-user",
        description: "The user to ban.",
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
      {
        name: "reason",
        description: "The reason for banning.",
        type: ApplicationCommandOptionType.String,
      },
    ],
  },

  run: async ({ interaction }) => {
    const targetUserId = interaction.options.get("target-user").value;
    const reason =
      interaction.options.get("reason")?.value || "No reason provided";

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      return interaction.editReply("That user doesn't exist in this server.");
    }

    if (targetUser.id === interaction.guild.ownerId) {
      return interaction.editReply(
        "You can't ban that user because they're the server owner.",
      );
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      return interaction.editReply(
        "You can't ban that user because they have the same/higher role than you.",
      );
    }

    if (targetUserRolePosition >= botRolePosition) {
      return interaction.editReply(
        "I can't ban that user because they have the same/higher role than me.",
      );
    }

    try {
      await targetUser.ban({ reason });
      await interaction.editReply(
        `User ${targetUser} was banned\nReason: ${reason}`,
      );
    } catch (error) {
      console.log(`There was an error when banning: ${error}`);
    }
  },

  options: {
    userPermissions: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.BanMembers],
  },
};
