const welcomeChannelSchema = require("../../models/WelcomeChannel");

/**
 *
 * @param {import('discord.js').GuildMember} guildMember
 */
module.exports = async (guildMember) => {
  try {
    if (guildMember.user.bot) return;

    const welcomeConfigs = await welcomeChannelSchema.find({
      guildId: guildMember.guild.id,
    });

    if (!welcomeConfigs.length) return;

    for (const welcomeConfig of welcomeConfigs) {
      const targetChannel =
        guildMember.guild.channels.cache.get(welcomeConfig.channelId) ||
        (await guildMember.guild.channels.fetch(welcomeConfig.channelId));

      if (!targetChannel) {
        welcomeChannelSchema
          .findOneAndDelete({
            guidlId: guildMember.guild.id,
            channelId: welcomeConfig.channelId,
          })
          .catch(() => {});
      }

      const customMessage =
        welcomeConfig.customMessage ||
        "Salut {username}, bienvenue a la {server-name}!";

      const welcomeMessage = customMessage
        .replaceAll("{mention-member}", `<@${guildMember.id}>`)
        .replaceAll("{username}", guildMember.user.username)
        .replaceAll("{server-name}", guildMember.guild.name)
        .replaceAll("{member-count}", String(guildMember.guild.memberCount)) // Use memberCount instead of approximate
        .replaceAll("\\n", "\n");

      targetChannel.send(welcomeMessage).catch(() => {});
    }
  } catch (error) {
    console.log(`Error in ${__filename}:\n`, error);
  }
};
