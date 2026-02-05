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
  setInterval(() => syncDailySchedule(client), 24 * 60 * 60 * 1000);
  syncDailySchedule(client);
}

async function syncDailySchedule(client) {
  const now = Math.floor(Date.now() / 1000);
  console.log("Checking AniList API...");

  const episodes = await getLatestAnimeId();

  if (!episodes || episodes.length === 0) {
    console.log("No episodes found in API response.");
    return;
  }

  const highRatedEpisodes = episodes.filter((ep) => ep.media.averageScore > 70);

  console.log(`\n=== HIGH RATED ANIME FOUND (${highRatedEpisodes.length}) ===`);
  highRatedEpisodes.forEach((ep) => {
    const title = ep.media.title.english || ep.media.title.romaji;
    // Formatage de la date de diffusion de l'épisode
    const releaseDate = new Date(ep.airingAt * 1000).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    console.log(`📌 Anime: ${title}`);
    console.log(`   Release Date: ${releaseDate}`);
    console.log(`   Score: ${ep.media.averageScore}%`);
    console.log("-----------------------------------");
  });
  /** 
  console.log(
    `Test: Sending notification for ${highRatedEpisodes[0].media.title.romaji} immediately.`,
  );
  await broadcastEpisode(client, highRatedEpisodes[0]);
  */

  for (const ep of highRatedEpisodes) {
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

  const rankingValue = `${firstRank}\n${secondRank}`;

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
    .setDescription(cleanDescription)
    .setColor(media.coverImage.color || "#0099ff")
    .setAuthor({
      name: "EPIC's Release Tracker",
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
        value: `${media.startDate.day}/${media.startDate.month}/${media.startDate.year}`,
        inline: true,
      },
      {
        name: "🍂 Season",
        value: `${media.season} ${media.startDate.year}`,
        inline: true,
      },
      {
        name: "📃 Status",
        value: `${media.status}` || "N/A",
        inline: true,
      },
      {
        name: "🎬 Studio",
        value: media.studios.nodes[0]?.name || "N/A",
        inline: true,
      },
      {
        name: "⏩ Episodes",
        value: `${media.episodes}` || "N/A",
        inline: true,
      },
      {
        name: "🏷️ Genres",
        value: media.genres.slice(0, 3).join(", "),
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

async function broadcastEpisode(client, ep) {
  const configs = await NotificationConfig.find({ notificationType: "Anime" });
  console.log(`Found ${configs.length} configs in database.`);

  if (configs.length === 0) {
    return;
  }

  const messageData = createAnimeEmbed(ep);

  for (const config of configs) {
    try {
      console.log(
        `Attempting to fetch channel: ${config.notificationChannelId}`,
      );
      const channel = await client.channels.fetch(config.notificationChannelId);

      if (!channel) {
        console.log(
          `❌ Stop: Channel ${config.notificationChannelId} not found.`,
        );
        continue;
      }

      console.log(`Sending message to #${channel.name}...`);
      await channel.send({
        content: `📢 Hey! New release for **${ep.media.title.english || ep.media.title.romaji}**!`,
        embeds: messageData.embeds,
        components: messageData.components,
      });

      console.log(`✅ Success: Message sent to ${channel.name}`);

      config.lastIdNotified = ep.id.toString();
      await config.save();
    } catch (err) {
      console.error(
        `❌ Discord API Error for channel ${config.notificationChannelId}:`,
        err.message,
      );
    }
  }
}

module.exports = { startAnimeWorker };
