require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const roasts = require('./roasts.json');
const protectedData = require('./friends.json');
const FRIEND_ROLE_ID = '1392799122137940039'; // 🔁 Replace with your actual Friend role ID

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
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

// Role add/remove helper (if needed elsewhere)
async function modifyRole(member, roleId, action) {
  try {
    const role = member.guild.roles.cache.get(roleId);
    if (!role) {
      console.error(`❌ Role with ID ${roleId} not found.`);
      return;
    }

    if (action === 'add') {
      await member.roles.add(role);
    } else if (action === 'remove') {
      await member.roles.remove(role);
    }
  } catch (err) {
    console.error(`❌ Failed to ${action} role:`, err);
  }
}

client.once('ready', () => {
  console.log(`🟢 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // 🔥 Roast command
  if (message.content.startsWith('!roast')) {
    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      return message.reply("Tag someone to roast! Example: `!roast @username`");
    }

    const member = message.guild.members.cache.get(targetUser.id);
    if (!member) return message.reply("I can't find that user.");

    // 🔐 Check if user has the friend role
    if (member.roles.cache.has(FRIEND_ROLE_ID)) {
      const response = getProtectedMessage(targetUser.id);
      return message.channel.send(`${message.author}, ${response}`);
    }

    // 🔥 If not protected, send random roast
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    return message.channel.send(`${targetUser}, ${roast}`);
  }

  // ✅ Add friend command
  if (message.content.startsWith('!addfriend')) {
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply("Mention someone to add as a friend. Example: `!addfriend @user`");
    }

    target.roles.add(FRIEND_ROLE_ID)
      .then(() => message.reply(`${target.user.username} has been given the friend role.`))
      .catch(err => {
        console.error(err);
        message.reply("❌ I couldn't add the role. Do I have permission?");
      });
  }

  // ✅ Remove friend command
  if (message.content.startsWith('!removefriend')) {
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply("Mention someone to remove. Example: `!removefriend @user`");
    }

    target.roles.remove(FRIEND_ROLE_ID)
      .then(() => message.reply(`${target.user.username} has been removed from the friend role.`))
      .catch(err => {
        console.error(err);
        message.reply("❌ I couldn't remove the role. Do I have permission?");
      });
  }
});

client.login(process.env.DISCORD_TOKEN);
