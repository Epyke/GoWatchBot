const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  deleted: true,
  name: "ban",
  description: "Bannis um membre du serveur",
  // devOnly: Boolean,
  // testOnly: Boolean,
  options: [
    {
      name: "utilizateur",
      description: "Utilizateur bannis.",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "raison",
      description: "Raison du banissement.",
      type: ApplicationCommandOptionType.String,
    },
  ],
  deleted: false,
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.Administrator],

  callback: (client, interaction) => {
    interaction.reply("ban..");
  },
};
