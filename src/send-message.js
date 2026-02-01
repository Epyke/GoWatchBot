require("dotenv").config();
const {
  Client,
  IntentsBitField,
  messageLink,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const roles = [
  {
    id: "1003731592675602452",
    label: "Signer le contract",
  },
  {
    id: "1466879186604920972",
    label: "Sign the contract",
  },
];

module.exports = { roles };

client.on("clientReady", async (c) => {
  try {
    const channel = await client.channels.cache.get("970813386566807572");
    if (!channel) return;

    const row = new ActionRowBuilder();

    roles.forEach((role) => {
      row.components.push(
        new ButtonBuilder()
          .setCustomId(role.id)
          .setLabel(role.label)
          .setStyle(ButtonStyle.Success),
      );
    });

    await channel.send({
      content:
        "Cliquez en dessous pour obtenir le role | Click below to get the role",
      components: [row],
    });

    process.exit();
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.BOT_TOKEN);
