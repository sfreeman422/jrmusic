'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getPlayer, destroyPlayer } = require('../PlayerManager');
const { infoEmbed, errorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playback, clear the queue, and disconnect the bot.'),

  /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({
        embeds: [errorEmbed('The bot is not currently in a voice channel.')],
        ephemeral: true,
      });
    }

    destroyPlayer(interaction.guildId);

    return interaction.reply({
      embeds: [infoEmbed('⏹️ Stopped playback and left the voice channel.')],
    });
  },
};
