const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
} = require("discord.js");
const User = require("../../models/User");
module.exports = {
  /**
   *
   * @param {Client} clientEncryption
   * @param {Interaction} interaction
   */
  callback: async (clientEncryption, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "Vous pouvez exécuter cet commande que dans un serveur",
        ephemeral: true,
      });
      return;
    }

    const targetUserId =
      interaction.options.get("utilisateur")?.value || interaction.member.id;

    await interaction.deferReply();
    const user = await User.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!user) {
      interaction.editReply(`<@${targetUserId}> n'a pas encore de compte.`);
      return;
    }

    interaction.editReply(
      targetUserId === interaction.member.id
        ? `Vous avez **${user.balance}$** sur votre compte.`
        : `<@${targetUserId} a **${user.balance}$** sur son compte.>`,
    );
  },
  name: "balance",
  description: "Voir le compte d'un utilisateur ou de sois même.",
  options: [
    {
      name: "utilisateur",
      description: "L'utilisateur en question",
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
};
