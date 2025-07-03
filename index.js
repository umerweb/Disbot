require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const roasts = require('./roasts.json');
const protectedData = require('./friends.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Utility to get a random message from a string or array
function getProtectedMessage(userId) {
  const entry = protectedData.users[userId];
  const messages = entry || protectedData.default;

  if (Array.isArray(messages)) {
    return messages[Math.floor(Math.random() * messages.length)];
  } else {
    return messages;
  }
}

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

    // 🔐 Check if the target is protected
    if (protectedData.users[target.id]) {
      const response = getProtectedMessage(target.id);
      message.channel.send(`${message.author}, ${response}`);
      return;
    }

    // 🔥 Regular roast
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    message.channel.send(`${target}, ${roast}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
