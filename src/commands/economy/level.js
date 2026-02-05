const {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const path = require("path");
const canvacord = require("canvacord");
const Level = require("../../models/Level");
const calculateLevelXp = require("../../utils/calculateLevelXp");
const background = path.join(__dirname, "../../assets/rankCard/moneyGun.jpg");
const font = canvacord.Font.fromFile(
  path.join(__dirname, "../../assets/fonts/LEMONMILK-Bold.otf"),
  "LemonMilk",
);
module.exports = {
  data: {
    name: "level",
    description: "Check your or someone else's level.",
    options: [
      {
        name: "user",
        description: "The user to check the level of.",
        type: ApplicationCommandOptionType.User,
      },
    ],
  },

  run: async ({ interaction }) => {
    if (!interaction.inGuild()) {
      interaction.reply(
        "Tu ne peux que utiliser cette commande dans un serveur",
      );
      return;
    }

    await interaction.deferReply();

    const mentionedUserid = interaction.options.get("utilisateur")?.value;
    const targetUserId = mentionedUserid || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const fetchedLevel = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!fetchedLevel) {
      interaction.editReply(
        mentionedUserid
          ? `${targetUserObj.user.tag}, n'a pas encore parlé dans le serveur, réesayez quand il aura ouvert sa bouche.`
          : `Tu n'as pas encore de niveau, parle un peu plus dans le chat.`,
      );
      return;
    }

    let allLevels = await Level.find({ guildId: interaction.guild.id }).select(
      "-_id userId level xp",
    );

    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let currentRank =
      allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    const rank = new canvacord.RankCardBuilder()
      .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
      .setRank(currentRank)
      .setLevel(fetchedLevel.level)
      .setCurrentXP(fetchedLevel.xp)
      .setRequiredXP(calculateLevelXp(fetchedLevel.level))
      .setStatus(targetUserObj.presence?.status || "offline")
      .setDisplayName(targetUserObj.user.displayName)
      .setUsername(targetUserObj.user.username)
      .setBackground(background)
      .setFonts(font);

    const data = await rank.build();
    const attachment = new AttachmentBuilder(data);
    interaction.editReply({ files: [attachment] });
  },
  name: "level",
  description: "Montre ton niveau ou celui d'un autre utilisateur",
  options: [
    {
      name: "utilisateur",
      description: "Voir niveau de l'utilisateur mentionné.",
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
};
