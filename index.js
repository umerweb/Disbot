require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const roasts = require('./roasts.json');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});




client.once('ready', () => {
  console.log(`🟢 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.content.startsWith('!roast')) {
    const target = message.mentions.users.first();
    if (!target) {
      message.reply("Tag someone to roast! Example: `!roast @username`");
      return;
    }

    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    message.channel.send(`${target}, ${roast}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
