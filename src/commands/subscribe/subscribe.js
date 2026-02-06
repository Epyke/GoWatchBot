const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const Subscribe = require("../../models/UserSubscription");
const axios = require("axios");

// Tracking des tracking MAL
const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

const data = new SlashCommandBuilder()
  .setName("subscribe")
  .setDescription(
    "Lier votre compte MyAnimeList pour recevoir des notifications en DM.",
  )
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("Votre pseudo MyAnimeList")
      .setRequired(true),
  );

/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({ interaction, client, handler }) {
  // 1. Vérification Config
  if (!MAL_CLIENT_ID) {
    return interaction.reply({
      content:
        "❌ **Erreur :** La variable `MAL_CLIENT_ID` n'est pas définie dans le fichier .env.",
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const username = interaction.options.getString("username");
  const discordId = interaction.user.id;

  // Configuration Header pour l'API MAL
  const malConfig = {
    headers: { "X-MAL-CLIENT-ID": MAL_CLIENT_ID },
  };

  try {
    // 2. Récupération des listes sur MAL (API V2)
    const [animeRes, mangaRes] = await Promise.allSettled([
      axios.get(
        `https://api.myanimelist.net/v2/users/${username}/animelist?status=watching&limit=1000`,
        malConfig,
      ),
      axios.get(
        `https://api.myanimelist.net/v2/users/${username}/mangalist?status=reading&limit=1000`,
        malConfig,
      ),
    ]);

    // Gestion User Introuvable
    if (
      animeRes.status === "rejected" &&
      animeRes.reason.response?.status === 404
    ) {
      return interaction.editReply(
        `❌ Le compte MyAnimeList **${username}** est introuvable.`,
      );
    }

    // Extraction des IDs MAL
    const malAnimeIds =
      animeRes.status === "fulfilled"
        ? animeRes.value.data.data.map((e) => e.node.id)
        : [];
    const malMangaIds =
      mangaRes.status === "fulfilled"
        ? mangaRes.value.data.data.map((e) => e.node.id)
        : [];

    if (malAnimeIds.length === 0 && malMangaIds.length === 0) {
      return interaction.editReply(
        `⚠️ **Aucun contenu trouvé.** Votre liste Watching/Reading est vide ou privée sur MAL.`,
      );
    }

    // 3. Conversion MAL ID -> AniList ID
    const anilistIds = await resolveMalIdsToAnilist(malAnimeIds, malMangaIds);

    // 4. Sauvegarde dans la DB
    await Subscribe.findOneAndUpdate(
      { discordId },
      {
        malUsername: username,
        trackedAnimeIds: anilistIds.anime,
        trackedMangaIds: anilistIds.manga,
      },
      { upsert: true, new: true },
    );

    const embed = new EmbedBuilder()
      .setTitle("✅ Compte lié !")
      .setDescription(
        `Je suis maintenant connecté au compte MAL **${username}**.\nJe surveille **${anilistIds.anime.length}** animes et **${anilistIds.manga.length}** mangas pour vous.`,
      )
      .setColor("Green")
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Erreur commande subscribe:", error?.message);
    await interaction.editReply(
      "❌ Une erreur est survenue lors de la connexion à MyAnimeList.",
    );
  }
}

// Helper: Convertit les IDs MAL en IDs AniList par lots
async function resolveMalIdsToAnilist(malAnimeIds, malMangaIds) {
  if (malAnimeIds.length === 0 && malMangaIds.length === 0)
    return { anime: [], manga: [] };

  // On coupe pour ne pas surcharger (max 50 pour l'exemple, idéalement il faudrait paginer si > 50)
  const vars = {
    malAnime: malAnimeIds.slice(0, 50),
    malManga: malMangaIds.slice(0, 50),
  };

  const query = `
    query ($malAnime: [Int], $malManga: [Int]) {
        anime: Page(perPage: 50) { media(idMal_in: $malAnime, type: ANIME) { id } }
        manga: Page(perPage: 50) { media(idMal_in: $malManga, type: MANGA) { id } }
    }`;

  try {
    const res = await axios.post("https://graphql.anilist.co", {
      query,
      variables: vars,
    });
    return {
      anime: res.data.data.anime
        ? res.data.data.anime.media.map((m) => m.id)
        : [],
      manga: res.data.data.manga
        ? res.data.data.manga.media.map((m) => m.id)
        : [],
    };
  } catch (e) {
    console.error("Erreur conversion GraphQL:", e.message);
    return { anime: [], manga: [] };
  }
}

module.exports = { data, run };
