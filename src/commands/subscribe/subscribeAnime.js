const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("subscribeAnime")
  .setDescription("Subscribe to an anime")
  .addStringOption((option) =>
    option
      .setName("anime")
      .setDescription("Anime to subscribe")
      .setRequired(true)
      .setAutocomplete(true),
  );
