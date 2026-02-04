const NotificationConfig = require("../models/NotificationConfig.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { getLatestAnimeId } = require("../services/anilist.js");

const scheduled = new Set();

async function startAnimeWorker(client) {
  // On synchronise toutes les 24 heures
  setInterval(() => syncDailySchedule(client), 24 * 60 * 60 * 1000);
  syncDailySchedule(client);
}

async function syncDailySchedule(client) {
  const now = Math.floor(Date.now() / 1000);
  const in24Hours = now + 86400;

  console.log("Synchronisation quotidienne du planning AniList...");
  const episodes = await getLatestAnimeId();

  if (!episodes) return;

  for (const ep of episodes) {
    if (scheduled.has(ep.id)) continue;

    const delay = (ep.airingAt - now - 5) * 1000;

    if (delay > 0) {
      scheduled.add(ep.id);
      setTimeout(async () => {
        await broadcastEpisode(client, ep);
        scheduled.delete(ep.id);
      }, delay);
    }
  }
}

function createAnimeEmbed(ep) {
  const media = ep.media;
  const cleanDescription = media.description
    ? media.description
        .replace(/<br>/g, "\n")
        .replace(/<i>|<\/i>/g, "*")
        .split("\n\n")[0]
    : "Aucune description disponible.";

  const animeEmbed = new EmbedBuilder()
    .setTitle(
      `${media.title.english || media.title.romaji} — Épisode ${ep.episode}`,
    )
    .setURL(media.siteUrl)
    .setDescription(cleanDescription)
    .setColor(media.coverImage.color || "#0099ff")
    .setAuthor({
      name: "EPIC's Release Tracker",
      iconURL: "https://anilist.co/img/icons/android-chrome-512x512.png",
      url: "https://anilist.co",
    })
    .addFields(
      {
        name: "⭐ Score",
        value: `${media.averageScore || "??"}%`,
        inline: true,
      },
      {
        name: "📈 Popularité",
        value: `${media.popularity.toLocaleString()}`,
        inline: true,
      },
      {
        name: "🎬 Studio",
        value: media.studios.nodes[0]?.name || "N/A",
        inline: true,
      },
      {
        name: "🍂 Saison",
        value: `${media.season} ${media.startDate.year}`,
        inline: true,
      },
      {
        name: "🏷️ Genres",
        value: media.genres.slice(0, 3).join(", "),
        inline: true,
      },
    )
    .setThumbnail(media.coverImage.extraLarge)
    .setImage(media.coverImage.extraLarge)
    .setFooter({
      text: `Statut: ${media.status} • AniList`,
      iconURL: "https://anilist.co/img/icons/favicon-32x32.png",
    })
    .setTimestamp(new Date(ep.airingAt * 1000));

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("AniList")
      .setURL(media.siteUrl)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setLabel("Crunchyroll")
      .setURL(
        `https://www.crunchyroll.com/search?q=${encodeURIComponent(media.title.romaji)}`,
      )
      .setStyle(ButtonStyle.Link),
  );

  return { embeds: [animeEmbed], components: [buttons] };
}

async function broadcastEpisode(client, ep) {
  const configs = await NotificationConfig.find({ notificationType: "Anime" });
  const messageData = createAnimeEmbed(ep);

  for (const config of configs) {
    try {
      const channel = await client.channels.fetch(config.notificationChannelId);
      if (channel) {
        await channel.send({
          content: `📢 Hey! New release for **${ep.media.title.romaji}**!`,
          embeds: messageData.embeds,
          components: messageData.components,
        });

        config.lastIdNotified = ep.id.toString();
        await config.save();
      }
    } catch (err) {
      console.error(`Erreur d'envoi (Salon: ${config.notificationChannelId})`);
    }
  }
}

module.exports = { startAnimeWorker };
