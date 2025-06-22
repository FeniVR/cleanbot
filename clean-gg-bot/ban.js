const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios'); // Make sure axios is installed

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a player from the game')
    .addStringOption(option =>
      option.setName('playerid')
        .setDescription('The ID of the player to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false)),
  
  async execute(interaction) {
    const playerId = interaction.options.getString('playerid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      // Call your game's API to ban the player
      const response = await axios.post('https://yourgameapi.com/ban', {
        playerId,
        reason
      });

      if (response.status === 200) {
        await interaction.reply(`✅ Player \`${playerId}\` has been banned from the game.\n**Reason:** ${reason}`);
      } else {
        await interaction.reply('❌ Failed to ban the player. Server responded with an error.');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('❌ An error occurred while trying to ban the player.');
    }
  }
};
