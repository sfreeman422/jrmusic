'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getPlayer } = require('../PlayerManager');
const { infoEmbed, errorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear all tracks from the queue (does not stop the current track).'),

  /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({
        embeds: [errorEmbed('The bot is not in a voice channel.')],
        ephemeral: true,
      });
    }

    player.queue.clear();
    return interaction.reply({
      embeds: [infoEmbed('🗑️ Queue cleared.')],
    });
  },
};
