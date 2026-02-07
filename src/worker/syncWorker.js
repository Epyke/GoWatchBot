// Fichier: src/worker/syncWorker.js
const Subscribe = require("../models/UserSubscription");
const axios = require("axios");
const { resolveMalIdsToAnilist } = require("../services/idMapper");

const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

async function syncAllUserLists(client) {
  console.log(
    "🔄 [Auto-Sync] Démarrage de la synchronisation des listes MAL...",
  );

  const allUsers = await Subscribe.find({});
  if (!allUsers.length)
    return console.log("   -> Aucun utilisateur à synchroniser.");

  let successCount = 0;
  let errorCount = 0;

  // On utilise une boucle for...of pour pouvoir utiliser 'await' et faire des pauses
  for (const user of allUsers) {
    try {
      const malConfig = { headers: { "X-MAL-CLIENT-ID": MAL_CLIENT_ID } };

      // 1. Récupérer les listes MAL à jour
      const [animeRes, mangaRes] = await Promise.allSettled([
        axios.get(
          `https://api.myanimelist.net/v2/users/${user.malUsername}/animelist?status=watching&limit=50&sort=list_updated_at`,
          malConfig,
        ),
        axios.get(
          `https://api.myanimelist.net/v2/users/${user.malUsername}/mangalist?status=reading&limit=50&sort=list_updated_at`,
          malConfig,
        ),
      ]);

      // Si erreur 404 (user supprimé ou banni de MAL)
      if (
        animeRes.status === "rejected" &&
        animeRes.reason.response?.status === 404
      ) {
        console.log(
          `⚠️ User MAL introuvable: ${user.malUsername}. Suppression de la DB.`,
        );
        await Subscribe.deleteOne({ _id: user._id });
        continue;
      }

      const malAnimeIds =
        animeRes.status === "fulfilled"
          ? animeRes.value.data.data.map((e) => e.node.id)
          : [];
      const malMangaIds =
        mangaRes.status === "fulfilled"
          ? mangaRes.value.data.data.map((e) => e.node.id)
          : [];

      // 2. Convertir en IDs AniList
      // On compare les longueurs pour voir si ça vaut le coup de mettre à jour
      const converted = await resolveMalIdsToAnilist(malAnimeIds, malMangaIds);

      // 3. Mise à jour DB (seulement si changement pour économiser les écritures)
      // (Ici on écrase brut pour être sûr d'avoir la dernière version)
      user.trackedAnimeIds = converted.anime;
      user.trackedMangaIds = converted.manga;
      await user.save();

      successCount++;

      // 4. PAUSE de 2 secondes pour ne pas se faire bannir par l'API MAL ou AniList
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Erreur sync pour ${user.malUsername}:`, error.message);
      errorCount++;
    }
  }

  console.log(
    `✅ [Auto-Sync] Terminé. Succès: ${successCount}, Erreurs: ${errorCount}`,
  );
}

module.exports = { syncAllUserLists };
