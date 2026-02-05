const { MessageFlags } = require("discord.js");

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "translate_desc") return false;

  await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

  const embed = interaction.message.embeds[0];
  const textToTranslate = embed?.description;

  if (!textToTranslate) {
    await interaction.editReply("Aucune description à traduire.");
    return true;
  }

  try {
    // Utilisation de la locale Discord de l'utilisateur
    let targetLang = interaction.locale.split("-")[0].toUpperCase();
    if (targetLang === "EN") targetLang = "EN-GB";

    const result = await client.deepl.translateText(
      textToTranslate,
      null,
      targetLang,
    );
    await interaction.editReply(
      `**[${targetLang}] Traduction :**\n\n${result.text}`,
    );
  } catch (error) {
    console.error(error);
    await interaction.editReply("La traduction a échoué.");
  }
  return true;
};
