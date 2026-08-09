import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getPlayer } from '../PlayerManager';
import { infoEmbed, errorEmbed } from '../utils/embeds';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Clear all tracks from the queue (does not stop the current track).');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const player = getPlayer(interaction.guildId);
  if (!player) {
    await interaction.reply({ embeds: [errorEmbed('The bot is not in a voice channel.')], ephemeral: true });
    return;
  }

  player.queue.clear();
  await interaction.reply({ embeds: [infoEmbed('🗑️ Queue cleared.')] });
}

export default { data, execute } satisfies Command;
