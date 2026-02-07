// Fichier: src/services/idMapper.js
const axios = require("axios");

async function resolveMalIdsToAnilist(malAnimeIds, malMangaIds) {
  // Si les deux listes sont vides, on retourne des tableaux vides
  if (
    (!malAnimeIds || malAnimeIds.length === 0) &&
    (!malMangaIds || malMangaIds.length === 0)
  ) {
    return { anime: [], manga: [] };
  }

  // On limite à 50 pour éviter les erreurs GraphQL (si un user a 1000 animes, on prend les 50 derniers ajoutés idéalement, ou on gère ça en amont)
  const vars = {
    malAnime: malAnimeIds ? malAnimeIds.slice(0, 50) : [],
    malManga: malMangaIds ? malMangaIds.slice(0, 50) : [],
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
    console.error("❌ Erreur conversion GraphQL:", e.message);
    return { anime: [], manga: [] };
  }
}

module.exports = { resolveMalIdsToAnilist };
