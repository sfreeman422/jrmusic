import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getPlayer } from '../PlayerManager';
import { infoEmbed, errorEmbed } from '../utils/embeds';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
  .setName('shuffle')
  .setDescription('Shuffle the tracks remaining in the queue.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const player = getPlayer(interaction.guildId);
  if (!player || player.queue.isEmpty) {
    await interaction.reply({ embeds: [errorEmbed('The queue is empty.')], ephemeral: true });
    return;
  }

  player.queue.shuffle();
  await interaction.reply({ embeds: [infoEmbed(`🔀 Shuffled **${player.queue.size}** track(s) in the queue.`)] });
}

export default { data, execute } satisfies Command;
