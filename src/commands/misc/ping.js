module.exports = {
  name: "ping",
  description: "Verifie si le bot est vivant",
  // devOnly: Boolean,
  //testOnly: Boolean,
  // options: Object[],
  // deleted: Boolean,
  deleted: false,
  callback: async (client, interaction) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`,
    );
  },
};
