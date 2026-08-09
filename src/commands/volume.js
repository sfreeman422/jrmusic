'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getPlayer } = require('../PlayerManager');
const { infoEmbed, errorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set the playback volume (0–200).')
    .addIntegerOption((opt) =>
      opt
        .setName('level')
        .setDescription('Volume level from 0 to 200 (default: 100)')
        .setMinValue(0)
        .setMaxValue(200)
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

    const level = interaction.options.getInteger('level', true);
    player.setVolume(level / 100);
    return interaction.reply({
      embeds: [infoEmbed(`🔊 Volume set to **${level}%**.`)],
    });
  },
};
