const { Client, Interaction } = require("discord.js");
const User = require("../../models/User");

const dailyAmount = 1500;

module.exports = {
  name: "daily",
  description: "Récupère ton argent quotidien.",
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "Tu peux exécuter cette commande que dans un serveur.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      let query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };

      let user = await User.findOne(query);

      if (user) {
        const lastDailyDate = user.lastDaily.toDateString();
        const currentDate = new Date().toDateString();

        if (lastDailyDate === currentDate) {
          interaction.editReply(
            "Tu as déjà empoché ton chèque quotidien. Reviens demain.",
          );
          return;
        }
      } else {
        user = new User({
          ...query,
          lastDaily: new Date(),
        });

        user.balance += dailyAmount;
        await user.save();

        interaction.editReply(
          `${dailyAmount}$ ont été ajouté a votre compte, vous avez ${user.balance}$ dans votre compte.`,
        );
      }
    } catch (error) {
      console.error(`Error with /daily ${error}`);
    }
  },
};
