'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getPlayer } = require('../PlayerManager');
const { nowPlayingEmbed, errorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show information about the currently playing track.'),

  /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    const track = player?.getNowPlaying();

    if (!track) {
      return interaction.reply({
        embeds: [errorEmbed('Nothing is playing right now.')],
        ephemeral: true,
      });
    }

    return interaction.reply({ embeds: [nowPlayingEmbed(track)] });
  },
};
