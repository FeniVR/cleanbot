const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');

const MOD_ROLE_NAME = 'Moderator';       // nazwa roli modów — możesz zmienić
const TICKET_CATEGORY_NAME = 'Tickets';  // nazwa kategorii ticketów — możesz zmienić

module.exports = {
  name: 'ticketpanel',

  // Komenda wysyłająca embed + przycisk
  async sendPanel(message) {
    const embed = new EmbedBuilder()
      .setTitle('Support Tickets')
      .setDescription('Click the button below to open a ticket!')
      .setColor('Blue');

    const button = new ButtonBuilder()
      .setCustomId('open_ticket')
      .setLabel('Open Ticket')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
  },

  // Obsługa kliknięć (interactionCreate)
  async handleInteraction(interaction) {
    if (!interaction.isButton()) return;

    const { guild, user } = interaction;

    if (interaction.customId === 'open_ticket') {
      // Sprawdzamy, czy user nie ma już otwartego ticketu
      const existing = guild.channels.cache.find(c => c.name === `ticket-${user.id}`);
      if (existing) {
        return interaction.reply({ content: 'You already have an open ticket!', ephemeral: true });
      }

      // Szukamy lub tworzymy kategorię ticketów
      let category = guild.channels.cache.find(c => c.name === TICKET_CATEGORY_NAME && c.type === ChannelType.GuildCategory);
      if (!category) {
        category = await guild.channels.create({
          name: TICKET_CATEGORY_NAME,
          type: ChannelType.GuildCategory,
        });
      }

      // Znajdujemy rolę modów
      const modRole = guild.roles.cache.find(r => r.name === MOD_ROLE_NAME);

      // Ustawiamy uprawnienia kanału ticketowego
      const permissionOverwrites = [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ];

      if (modRole) {
        permissionOverwrites.push({
          id: modRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        });
      }

      // Tworzymy kanał ticketowy
      const ticketChannel = await guild.channels.create({
        name: `ticket-${user.id}`,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites,
      });

      // Przycisk zamknięcia ticketu
      const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const closeRow = new ActionRowBuilder().addComponents(closeButton);

      const ticketEmbed = new EmbedBuilder()
        .setTitle('Ticket Support')
        .setDescription(`Hello ${user}, thank you for opening a ticket! A moderator will be with you shortly.`)
        .setColor('Green');

      await ticketChannel.send({ content: `${user}`, embeds: [ticketEmbed], components: [closeRow] });

      await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.customId === 'close_ticket') {
      await interaction.reply({ content: 'Closing ticket in 5 seconds...', ephemeral: true });
      setTimeout(() => {
        interaction.channel.delete().catch(console.error);
      }, 5000);
    }
  },
};
