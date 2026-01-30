const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Répond avec le Pong et les informations de latence'),
    async execute(interaction) {
        const sent = await interaction.deferReply({ fetchReply: true });
        const pingTime = sent.createdTimestamp - interaction.createdTimestamp;

        await interaction.editReply(
            `**Pong !**\n` +
            `Latence du bot : \`${pingTime}ms\`\n` +
            `Latence API Discord : \`${Math.round(interaction.client.ws.ping)}ms\``
        );
    },
};