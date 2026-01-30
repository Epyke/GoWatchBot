const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Répond avec le Pong et la latence'),
    async execute(interaction) {
        // 1. On informe immédiatement Discord qu'on traite la demande
        // fetchReply: true permet de récupérer le message pour calculer la latence
        const sent = await interaction.deferReply({ fetchReply: true });

        const pingTime = sent.createdTimestamp - interaction.createdTimestamp;

        // 2. On utilise editReply (et non reply) car la réponse a été différée
        await interaction.editReply(
            `🏓 **Pong !**\n` +
            `• Latence Bot : \`${pingTime}ms\`\n` +
            `• Latence API : \`${Math.round(interaction.client.ws.ping)}ms\``
        );
    },
};