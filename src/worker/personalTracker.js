const Subscribe = require("../models/UserSubscription");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const axios = require("axios");

async function checkPersonalReleases(client) {
  // 1. Récupérer tous les abonnements en base de données
  const allSubs = await Subscribe.find({});
  if (!allSubs.length) return;

  // Créer un Set unique de tous les IDs d'anime surveillés pour optimiser la requête
  const allTrackedAnime = new Set();
  allSubs.forEach((sub) =>
    sub.trackedAnimeIds.forEach((id) => allTrackedAnime.add(id)),
  );

  if (allTrackedAnime.size === 0) return;

  // 2. Définir la fenêtre de temps (Ce qui est sorti il y a entre 10 et 30 minutes)
  // Cela permet de ne pas rater d'épisode tout en évitant les doublons immédiats
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - 30 * 60;
  const windowEnd = now - 10 * 60;

  // 3. Requête GraphQL DÉTAILLÉE (Identique à votre animeWorker pour avoir toutes les infos)
  const query = `
    query ($start: Int, $end: Int) {
        Page {
            airingSchedules(airingAt_greater: $start, airingAt_lesser: $end) {
                id
                airingAt
                episode
                media {
                    id
                    siteUrl
                    title { english romaji }
                    coverImage { extraLarge color }
                    bannerImage
                    description(asHtml: false)
                    averageScore
                    genres
                    status
                    episodes
                    season
                    startDate { day month year }
                    rankings {
                        rank
                        type
                        season
                        year
                        context
                    }
                    studios(sort: NAME, isMain: true) {
                        nodes { name }
                    }
                    trailer { id site }
                }
            }
        }
    }`;

  try {
    const response = await axios.post("https://graphql.anilist.co", {
      query,
      variables: { start: windowStart, end: windowEnd },
    });

    const schedules = response.data.data.Page.airingSchedules;

    // 4. Traitement et Envoi
    for (const schedule of schedules) {
      // Si cet anime est surveillé par au moins une personne
      if (allTrackedAnime.has(schedule.media.id)) {
        // Générer l'embed riche
        const messageData = createAnimeEmbed(schedule);

        // Filtrer les utilisateurs qui suivent PRÉCISÉMENT cet anime
        const usersToNotify = allSubs.filter((sub) =>
          sub.trackedAnimeIds.includes(schedule.media.id),
        );

        for (const userSub of usersToNotify) {
          try {
            const user = await client.users.fetch(userSub.discordId);

            await user.send({
              content: `🔔 **Nouvel épisode !** Vous suivez *${schedule.media.title.romaji}*.`,
              embeds: messageData.embeds,
              components: messageData.components,
            });

            console.log(`[Perso] ✅ Notification envoyée à ${user.tag}`);
          } catch (err) {
            // LOG DÉTAILLÉ DE L'ERREUR
            console.error(`[Perso] ❌ Échec pour ${userSub.discordId}:`);
            console.error(`   Code: ${err.code}`);
            console.error(`   Message: ${err.message}`);

            if (err.code === 50007)
              console.error(
                "   -> RAISON: L'utilisateur a fermé ses DMs ou bloqué le bot.",
              );
            if (err.code === 50001)
              console.error(
                "   -> RAISON: Le bot n'a pas la permission (Intents manquants sur le portail dev ?)",
              );
          }
        }
      }
    }
  } catch (e) {
    console.error("Erreur Personal Tracker:", e.message);
  }
}

// --- FONCTION DE GÉNÉRATION D'EMBED (Copiée et adaptée de votre script) ---

function createAnimeEmbed(ep) {
  const media = ep.media;

  function formatRank(rankings, index) {
    const r = rankings && rankings[index];
    if (!r) return "N/A";
    let result = `#${r.rank}`;
    if (r.season) result += ` ${r.season}`;
    if (r.year) result += ` ${r.year}`;
    if (r.context) result += ` ${r.context}`;
    return `${result}`;
  }

  const rankingsArray = media.rankings || [];
  let firstRank = formatRank(rankingsArray, 0);
  let secondRank = formatRank(rankingsArray, 1);

  let trailerUrl = null;
  if (media.trailer && media.trailer.site === "youtube") {
    trailerUrl = `https://www.youtube.com/watch?v=${media.trailer.id}`;
  }

  const cleanDescription = media.description
    ? media.description
        .replace(/<br>/g, "\n")
        .replace(/<i>|<\/i>/g, "*")
        .split("\n\n")[0]
    : "Aucune description disponible.";

  const animeEmbed = new EmbedBuilder()
    .setTitle(
      `${media.title.english || media.title.romaji} - Episode ${ep.episode}`,
    )
    .setURL(media.siteUrl)
    .setDescription(cleanDescription.substring(0, 4096)) // Sécurité limite Discord
    .setColor(media.coverImage.color || "#0099ff")
    .setAuthor({
      name: "Notification Personnelle", // Changé pour différencier du serveur
      iconURL: "https://i.imgur.com/vtgzfxV.png",
    })
    .addFields(
      {
        name: "⭐ Score",
        value: `${media.averageScore || "??"}% average score`,
        inline: false,
      },
      {
        name: "🏆 1st Rank",
        value: firstRank,
        inline: false,
      },
      {
        name: "🏅 2nd Rank",
        value: secondRank,
        inline: false,
      },
      {
        name: "📆 Start Date",
        value: `${media.startDate.day || "?"}/${media.startDate.month || "?"}/${media.startDate.year || "?"}`,
        inline: true,
      },
      {
        name: "🍂 Season",
        value: `${media.season || "?"} ${media.startDate.year || ""}`,
        inline: true,
      },
      {
        name: "📃 Status",
        value: `${media.status}` || "N/A",
        inline: true,
      },
      {
        name: "🎬 Studio",
        value: media.studios?.nodes[0]?.name || "N/A",
        inline: true,
      },
      {
        name: "⏩ Episodes",
        value: `${media.episodes || "?"}`,
        inline: true,
      },
      {
        name: "🏷️ Genres",
        value: media.genres?.slice(0, 3).join(", ") || "N/A",
        inline: true,
      },
    )
    .setThumbnail(media.coverImage.extraLarge)
    .setImage(media.bannerImage || media.coverImage.extraLarge)
    .setFooter({
      text: `Statut: ${media.status} • AniList`,
      iconURL: "https://anilist.co/img/icons/favicon-32x32.png",
    })
    .setTimestamp(new Date(ep.airingAt * 1000));

  const buttons = new ActionRowBuilder();

  buttons.addComponents(
    new ButtonBuilder()
      .setLabel("AniList")
      .setURL(media.siteUrl)
      .setStyle(ButtonStyle.Link),
  );

  // Note: Le bouton Translate ne marchera que si vous avez un event handler pour "translate_desc"
  buttons.addComponents(
    new ButtonBuilder()
      .setCustomId("translate_desc")
      .setLabel("Translate")
      .setEmoji("🌍")
      .setStyle(ButtonStyle.Secondary),
  );

  if (trailerUrl) {
    buttons.addComponents(
      new ButtonBuilder()
        .setLabel("Trailer")
        .setURL(trailerUrl)
        .setStyle(ButtonStyle.Link)
        .setEmoji("🎥"),
    );
  }

  return { embeds: [animeEmbed], components: [buttons] };
}

module.exports = { checkPersonalReleases };
