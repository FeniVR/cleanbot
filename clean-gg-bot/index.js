require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const ticketPanel = require('./ticketPanel');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.once('ready', () => {
    console.log(`Bot zalogowany jako ${client.user.tag} a tak na serio wypierdalaj feni :3`);

    // Ustawienie statusu bota
    client.user.setPresence({
        activities: [
            {
                name: 'over Clean.gg servers | 🛡️',
                type: 3 // Watching
            }
        ],
        status: 'online'
    });
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        await message.channel.send('Pong!');
    }

    if (message.content.startsWith('!trustscore')) {
        const args = message.content.split(' ');
        if (args.length < 2) {
            return message.channel.send('Please mention a user, e.g. `!trustscore @username`');
        }
        await message.channel.send(`Trust Score for ${args[1]} is: 100 (example)`);
    }

    if (message.content === '!help') {
        const helpMessage = `
**Clean.gg Bot Commands:**

\`!ping\` - Check if the bot is online.
\`!trustscore @user\` - Get the trust score of a user (example).
\`!ticketpanel\` - Show ticket panel to open support tickets.
\`!help\` - Display this help message.

*More commands coming soon!*
        `;
        await message.channel.send(helpMessage);
    }

    if (message.content === '!ticketpanel') {
        await ticketPanel.sendPanel(message);
    }
});

client.on('interactionCreate', async interaction => {
    await ticketPanel.handleInteraction(interaction);
});

client.login(process.env.DISCORD_TOKEN);
