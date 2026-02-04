const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const NotificationConfig = require("../../models/NotificationConfig");

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    // 1. Vérification si on est dans un serveur
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "Vous ne pouvez exécuter cette commande que dans un serveur.",
        ephemeral: true,
      });
      return;
    }

    try {
      // 2. On diffère la réponse (Ephemeral pour que seul l'admin voit)
      await interaction.deferReply({ flag: MessageFlags.Ephemeral });

      const targetType = interaction.options.get("type").value;

      // 3. Recherche et suppression dans la base de données
      const deletedConfig = await NotificationConfig.findOneAndDelete({
        guildId: interaction.guildId,
        notificationType: targetType,
      });

      // 4. Si aucune configuration n'existait
      if (!deletedConfig) {
        await interaction.editReply({
          content: `❌ Aucune configuration active trouvée pour les notifications **${targetType}** sur ce serveur.`,
        });
        return;
      }

      // 5. Création de l'Embed de confirmation (Rouge pour suppression)
      const embed = new EmbedBuilder()
        .setTitle("🗑️ Notifications Désactivées")
        .setColor(0xff0000)
        .setDescription(
          `Les notifications pour **${targetType}** ont été arrêtées avec succès.`,
        )
        .addFields({
          name: "Ancien Salon",
          value: `<#${deletedConfig.notificationChannelId}>`,
          inline: true,
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(`Erreur dans notification-remove.js:\n`, error);
      if (interaction.deferred) {
        await interaction.editReply(
          "Une erreur est survenue lors de la suppression de la configuration.",
        );
      }
    }
  },

  name: "notification-remove",
  description: "Désactiver les notifications pour un type spécifique.",

  // Format des options pour ton Handler
  options: [
    {
      name: "type",
      description: "Le type de notification à supprimer",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "FreeGames", value: "FreeGames" },
        { name: "Anime", value: "Anime" },
        { name: "Movie", value: "Movie" },
      ],
    },
  ],
};
