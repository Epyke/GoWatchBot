const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get("utilisateur").value;
    const reason =
      interaction.options.get("raison")?.value || "Raison non mentionné.";

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply("L'utilisateur n'est plus dans le serveur.");
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply(
        "Vous ne pouvez pas expulser cet utilisateur puisque c'est le proprietaire du serveur.",
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "Vous ne pouvez pas expulser cet utilisateur car il a le même niveau de permissions que vous.",
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "Je n'est pas les permissions requises pour expulser cet utilisateur.",
      );
      return;
    }

    try {
      await targetUser.kick({ reason });
      await interaction.editReply(
        `L'utilisateur ${targetUser} a été officiellement renié de la famille.\nRaison: ${reason}`,
      );
    } catch (error) {
      console.error(error);
    }
  },

  deleted: true,
  name: "kick",
  description: "Expulse um membre du serveur",
  // devOnly: Boolean,
  // testOnly: Boolean,
  options: [
    {
      name: "utilisateur",
      description: "Utilisateur expulsé.",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "raison",
      description: "Raison de l'expulsion.",
      type: ApplicationCommandOptionType.String,
    },
  ],
  deleted: false,
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
};
