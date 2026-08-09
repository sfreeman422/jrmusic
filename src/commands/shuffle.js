'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getPlayer } = require('../PlayerManager');
const { infoEmbed, errorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the tracks remaining in the queue.'),

  /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player || player.queue.isEmpty) {
      return interaction.reply({
        embeds: [errorEmbed('The queue is empty.')],
        ephemeral: true,
      });
    }

    player.queue.shuffle();
    return interaction.reply({
      embeds: [infoEmbed(`🔀 Shuffled **${player.queue.size}** track(s) in the queue.`)],
    });
  },
};
