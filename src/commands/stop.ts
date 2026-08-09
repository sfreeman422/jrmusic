import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getPlayer, destroyPlayer } from '../PlayerManager';
import { infoEmbed, errorEmbed } from '../utils/embeds';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Stop playback, clear the queue, and disconnect the bot.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const player = getPlayer(interaction.guildId);
  if (!player) {
    await interaction.reply({ embeds: [errorEmbed('The bot is not currently in a voice channel.')], ephemeral: true });
    return;
  }

  destroyPlayer(interaction.guildId);
  await interaction.reply({ embeds: [infoEmbed('⏹️ Stopped playback and left the voice channel.')] });
}

export default { data, execute } satisfies Command;
