const {  SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latency information'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true});
        const pingTime = sent.createdTimeStamp - interaction.createdTimeStamp;

        await interaction.editReply(`Pong! \nLatence: ${pingTime}ms\nLatence API: ${Math.round(interaction.client.ws.ping)}ms`)
    },
};