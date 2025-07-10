require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const roasts = require('./roasts.json');
const protectedData = require('./friends.json');
const hauntRoasts = require('./haunts.json');

const FRIEND_ROLE_ID = '1392799122137940039';
const HAUNT_ROLE_ID = '1392805654607167581';

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

// Role add/remove helper (optional usage)
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

    if (member.roles.cache.has(FRIEND_ROLE_ID)) {
      const response = getProtectedMessage(targetUser.id);
      return message.channel.send(`${message.author}, ${response}`);
    }

    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    return message.channel.send(`${targetUser}, ${roast}`);
  }

  // ✅ Add friend command (Admins only)
  if (message.content.startsWith('!addfriend')) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply("❌ Only administrators can use this command.");
    }

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

  // ✅ Remove friend command (Admins only)
  if (message.content.startsWith('!removefriend')) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply("❌ Only administrators can use this command.");
    }

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

  // ✅ Add haunt command (Admins only)
  if (message.content.startsWith('!curse')) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply("❌ Only administrators can use this command.");
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply("Mention someone to haunt. Example: `!addhaunt @user`");
    }

    target.roles.add(HAUNT_ROLE_ID)
      .then(() => message.reply(`${target.user.username} has been cursed.`))
      .catch(err => {
        console.error(err);
        message.reply("❌ I couldn't add the haunt role. Do I have permission?");
      });
  }

  // ✅ Remove haunt command (Admins only)
  if (message.content.startsWith('!leaveit')) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply("❌ Only administrators can use this command.");
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply("Mention someone to unhaunt. Example: `!removehaunt @user`");
    }

    target.roles.remove(HAUNT_ROLE_ID)
      .then(() => message.reply(`${target.user.username} ok, I will leave.`))
      .catch(err => {
        console.error(err);
        message.reply("❌ I couldn't remove the haunt role. Do I have permission?");
      });
  }

  // 👻 Auto roast users with the "haunt" role
  if (message.member && message.member.roles.cache.has(HAUNT_ROLE_ID)) {
    const roast = hauntRoasts[Math.floor(Math.random() * hauntRoasts.length)];
    return message.reply(roast);
  }
});

client.login(process.env.DISCORD_TOKEN);
