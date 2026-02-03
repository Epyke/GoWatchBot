const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const mentionable = interaction.options.get("utilisateur").value;
    const duration = interaction.options.get("duree").value;
    const reason =
      interaction.options.get("raison")?.value || "Raison non mentionné";

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(mentionable);
    if (!targetUser) {
      await interaction.editReply("L'utilisateur n'est plus dans le serveur.");
      return;
    }

    if (targetUser.user.bot) {
      await interaction.editReply("Un bot ne peut pas être timeout.");
      return;
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      await interaction.editReply("Entrez une valeur de durée valide.");
      return;
    }

    if (msDuration < 5000 || msDuration > 2.419e9) {
      await interaction.editReply(
        "La durée du timeout ne peut pas être inferieur a 5 secondes et supérieur 28 jours.",
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "Vous ne pouvez pas timeout cet utilisateur car il a le même/supérieur niveau de permissions que vous.",
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "Je n'est pas les permissions requises pour timeout cet utilisateur.",
      );
      return;
    }

    try {
      const { default: prettyMs } = await import("pretty-ms");

      if (targetUser.isCommunicationDisabled()) {
        await targetUser.timeout(msDuration, reason);
        await interaction.editReply(
          `Le timeout de ${targetUser} a été prolongé a ${prettyMs(msDuration, { verbose: true })}\nRaison: ${reason}`,
        );
        return;
      }

      await targetUser.timeout(msDuration, reason);
      await interaction.editReply(
        `${targetUser} a été timeout pendant ${prettyMs(msDuration, { verbose: true })}\nRaison: ${reason}`,
      );
    } catch (error) {
      console.error(error);
    }
  },
  name: "timeout",
  description: "Timeout un utilisateur",
  options: [
    {
      name: "utilisateur",
      description: "L'utilisateur qui vas être timeout",
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: "duree",
      description: "Durée du timeout",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "raison",
      description: "Raison du timeout",
      type: ApplicationCommandOptionType.String,
    },
  ],
  PermissionFlagsBits: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};
