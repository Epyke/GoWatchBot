const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const NotificationConfig = require("../../models/NotificationConfig");
const { getLatestAnimeId } = require("../../services/anilist.js");

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
      // 2. Différer la réponse (pour éviter le timeout de 3s)
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // 3. Récupération des options
      const targetChannelId = interaction.options.get("target-channel").value;
      const targetType = interaction.options.get("type").value;

      // 4. Vérification si une config existe déjà
      const duplicateExists = await NotificationConfig.exists({
        guildId: interaction.guildId,
        notificationType: targetType,
      });

      if (duplicateExists) {
        await interaction.editReply(
          `Cette option est déjà activée pour ce serveur.\nUtilisez \`/notification-remove\` d'abord.`,
        );
        return;
      }

      // 5. Récupération de l'ID AniList
      const latestIdFromApi = await getLatestAnimeId();

      // 6. Sauvegarde en Base de données
      await NotificationConfig.create({
        guildId: interaction.guildId,
        notificationChannelId: targetChannelId,
        notificationType: targetType,
        lastIdNotified: latestIdFromApi ? latestIdFromApi.toString() : null,
        lastChecked: new Date(),
      });

      // 7. Création de l'Embed de succès
      const embed = new EmbedBuilder()
        .setTitle(`✅ Notifications Activées !`)
        .setColor(0x00ff00)
        .setDescription(
          `Le salon <#${targetChannelId}> recevra désormais les alertes **${targetType}**.`,
        )
        .setFooter({ text: "Service connecté" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(`Erreur dans notification-setup.js:\n`, error);
      if (interaction.deferred) {
        await interaction.editReply(
          "Une erreur est survenue lors de la configuration.",
        );
      }
    }
  },

  name: "notification-setup",
  description: "Configurer les notifications pour un salon spécifique.",
  // Utilisation du format "options" attendu par ton Handler
  options: [
    {
      name: "target-channel",
      description: "Le salon où envoyer les notifications",
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
      required: true,
    },
    {
      name: "type",
      description: "Le type de contenu (Anime, FreeGames...)",
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
