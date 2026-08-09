'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getPlayer } = require('../PlayerManager');
const { infoEmbed, errorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the currently playing track.'),

  /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player || !player.getNowPlaying()) {
      return interaction.reply({
        embeds: [errorEmbed('Nothing is playing right now.')],
        ephemeral: true,
      });
    }

    player.pause();
    return interaction.reply({ embeds: [infoEmbed('⏸️ Paused.')] });
  },
};
