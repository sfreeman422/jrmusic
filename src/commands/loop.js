'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getPlayer } = require('../PlayerManager');
const { infoEmbed, errorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggle queue loop mode on or off.'),

  /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({
        embeds: [errorEmbed('The bot is not in a voice channel.')],
        ephemeral: true,
      });
    }

    player.queue.loop = !player.queue.loop;
    const status = player.queue.loop ? '🔁 Loop **enabled**.' : '➡️ Loop **disabled**.';
    return interaction.reply({ embeds: [infoEmbed(status)] });
  },
};
