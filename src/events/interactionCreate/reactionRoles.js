const { Client, Interaction, MessageFlags } = require("discord.js");

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

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 * @returns
 */
module.exports = async (interaction, client) => {
  try {
    if (!interaction.isButton()) return;

    const roleIds = roles.map((r) => r.id);
    if (!roleIds.includes(interaction.customId)) return;

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

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
};
