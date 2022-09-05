import logger from "./utils/logger";
import { token } from "./config.json";

import fetch from "node-fetch";

import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Partials,
  Message,
} from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.ThreadMember,
  ],
});

client.once("ready", () => {
  logger.info("Ready!");
});

async function patchNotes(message: Message, args: string[]) {
  var index = 0;
  if (args.length > 0) {
    if (args[1] === "latest" || args[1] === "") {
      index = 0;
    } else {
      index = parseInt(args[1]);
    }
  }
  if (isNaN(index)) {
    index = 0;
  }

  console.log(index);
  const res = await fetch(
    "https://playvalorant.com/page-data/en-us/news/game-updates/page-data.json"
  );
  const json = await res.json();
  const patchNotes = json.result.pageContext.data.articles.filter(
    (article: any) => article.title.toLowerCase().includes("patch")
  );
  patchNotes.sort((a: any, b: any) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (index >= patchNotes.length) {
    index = patchNotes.length - 1;
  }

  const embed = new EmbedBuilder()
    .setTitle(patchNotes[index].title)
    .setURL(`https://playvalorant.com/en-us${patchNotes[index].url.url}`)
    .setDescription(patchNotes[index].description)
    .setTimestamp(new Date(patchNotes[index].date))
    .setImage(patchNotes[index].banner.url)
    .setColor("#00ff00")
    .setFooter({
      text: patchNotes[index].title,
      iconURL:
        "https://playvalorant.com/static/9b1d9b8e8e8c6c6c6c6c6c6c6c6c6c6c/6b1d9b8e8e8c6c6c6c6c6c6c6c6c6c6c/valorant-logo.png",
    });

  await message.channel.send({ embeds: [embed] });
}

// https://playvalorant.com/page-data/en-us/news/game-updates/page-data.json
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!")) {
    return;
  }
  switch (message.content.split(" ")[0]) {
    case "!patchnotes":
      await patchNotes(message, message.content.split(" "));
      break;
    case "!pn":
      await patchNotes(message, message.content.split(" "));
      break;
    case "!help":
      const embed = new EmbedBuilder()
        .setTitle("Help")
        .setDescription("List of commands")
        // .addFields("!patchnotes", "Get the latest patch notes")
        .addFields({
          name: "!patchnotes, !pn",
          value: "Get the latest patch notes",
        })
        .setColor("#00ff00")
        .setFooter({
          text: "Help",
          iconURL:
            "https://playvalorant.com/static/9b1d9b8e8e8c6c6c6c6c6c6c6c6c6c6c/6b1d9b8e8e8c6c6c6c6c6c6c6c6c6c6c/valorant-logo.png",
        })
        .setTimestamp(new Date());

      await message.channel.send({ embeds: [embed] });
      break;
    default:
      await message.channel.send("Invalid command");
      break;
  }
});

// import fs from "fs";
// // loop that checks for new patch notes every 60 minutes
// setInterval(async () => {
//   // check for file "last"
//   if (!fs.existsSync("./last")) {
//     fs.writeFileSync("./last", "");
//   }
//   const res = await fetch(
//     "https://playvalorant.com/page-data/en-us/news/game-updates/page-data.json"
//   );
//   const json = await res.json();
//   const patchNotes = json.result.pageContext.data.articles.filter(
//     (article: any) => article.title.toLowerCase().includes("patch")
//   );
//   patchNotes.sort((a: any, b: any) => {
//     return new Date(b.date).getTime() - new Date(a.date).getTime();
//   });


//   const embed = new EmbedBuilder()
//     .setTitle(patchNotes[0].title)
//     .setURL(`https://playvalorant.com/en-us${patchNotes[0].url.url}`)
//     .setDescription(patchNotes[0].description)
//     .setTimestamp(new Date(patchNotes[0].date))
//     .setImage(patchNotes[0].banner.url)
//     .setColor("#00ff00")
//     .setFooter({
//       text: patchNotes[0].title,
//       iconURL:
//         "https://playvalorant.com/static/9b1d9b8e8e8c6c6c6c6c6c6c6c6c6c6c/6b1d9b8e8e8c6c6c6c6c6c6c6c6c6c6c/valorant-logo.png",
//     });

//   // await message.channel.send({ embeds: [embed] });
//   // send to 1016146447692996752
//   await client.channels.cache.get("1016146447692996752")?.send({ embeds: [embed] });

// });

client.login(token);
