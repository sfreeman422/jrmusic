'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getPlayer } = require('../PlayerManager');
const { queueListEmbed, errorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current music queue.')
    .addIntegerOption((opt) =>
      opt.setName('page').setDescription('Page number').setMinValue(1),
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

    const page = interaction.options.getInteger('page') ?? 1;
    return interaction.reply({
      embeds: [queueListEmbed(player.queue.tracks, player.getNowPlaying(), page)],
    });
  },
};
