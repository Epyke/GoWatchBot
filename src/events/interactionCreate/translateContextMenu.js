const { Client, Interaction, MessageFlags } = require("discord.js");

// Dictionnaire pour localiser les étiquettes de réponse
const labels = {
  fr: {
    original: "Original",
    translated: "Traduit",
    error: "La traduction a échoué.",
  },
  en: {
    original: "Original",
    translated: "Translated",
    error: "Translation failed.",
  },
  es: {
    original: "Original",
    translated: "Traducido",
    error: "La traducción falló.",
  },
  pt: {
    original: "Original",
    translated: "Traduzido",
    error: "A tradução falhou.",
  },
};

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (interaction, client) => {
  if (!interaction.isMessageContextMenuCommand()) return;

  if (interaction.commandName === "Translate message") {
    const targetMessageContent = interaction.targetMessage.content;

    // 1. Détection de la langue de l'utilisateur
    const userLang = interaction.locale.split("-")[0];
    const msg = labels[userLang] || labels.en; // Fallback anglais si langue inconnue

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      // 2. Préparation du code langue pour DeepL
      let targetLang = interaction.locale.toUpperCase();

      // Ajustements spécifiques pour DeepL
      if (targetLang.startsWith("EN")) targetLang = "EN-GB";
      if (targetLang.startsWith("PT")) targetLang = "PT-PT";

      const result = await client.deepl.translateText(
        targetMessageContent,
        null, // Auto-détection de la langue source
        targetLang,
      );

      // 3. Réponse formatée avec les étiquettes traduites
      await interaction.editReply(
        `**${msg.original}:** ${targetMessageContent}\n**${msg.translated} [${targetLang}]:** ${result.text}`,
      );
    } catch (error) {
      console.error("DeepL Context Menu Error:", error);
      await interaction.editReply(msg.error);
    }
  }
};
