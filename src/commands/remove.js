'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getPlayer } = require('../PlayerManager');
const { infoEmbed, errorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a track from the queue by its position.')
    .addIntegerOption((opt) =>
      opt
        .setName('position')
        .setDescription('1-based position in the queue')
        .setMinValue(1)
        .setRequired(true),
    ),

  /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({
        embeds: [errorEmbed('The bot is not in a voice channel.')],
        ephemeral: true,
      });
    }

    const pos = interaction.options.getInteger('position', true);
    const removed = player.queue.removeAt(pos);

    if (!removed) {
      return interaction.reply({
        embeds: [errorEmbed(`No track at position **${pos}**.`)],
        ephemeral: true,
      });
    }

    return interaction.reply({
      embeds: [infoEmbed(`🗑️ Removed **${removed.title}** from the queue.`)],
    });
  },
};
