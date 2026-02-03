const { Client, ActivityType } = require("discord.js");

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

module.exports = (client) => {
  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 150000);
  console.log(`${client.user.tag} est en ligne`);
};
