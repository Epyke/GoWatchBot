require("dotenv").config();
const { Client, IntentsBitField, ActivityType } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");

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

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

let status = [
  {
    name: "Aider la famille",
    type: ActivityType.Playing,
  },
  {
    name: "Aider la famille",
    type: ActivityType.Streaming,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1",
  },
];

eventHandler(client);

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isButton()) return;
    await interaction.deferReply({ ephemeral: true });

    const role = interaction.guild.roles.cache.get(interaction.customId);
    if (!role) {
      interaction.editReply({
        content: "Role atribué inexistant",
      });
      return;
    }

    let hasRole = false;
    let memberRole = null;

    for (const r of roles) {
      if (interaction.member.roles.cache.has(r.id)) {
        hasRole = true;
        memberRole = r;
      }
    }

    if (hasRole) {
      if (role.id === "1003731592675602452") {
        await interaction.editReply(
          `Tu possède déja le role <@&${memberRole.id}>`,
        );
      } else {
        await interaction.editReply(`You already have <@&${memberRole.id}>`);
      }
      return;
    }

    await interaction.member.roles.add(role);
    if (role === "1003731592675602452") {
      await interaction.editReply(`Vous avez reçu le rôle ${role}.`);
    } else {
      await interaction.editReply(`You got the role ${role}.`);
    }
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.BOT_TOKEN);
