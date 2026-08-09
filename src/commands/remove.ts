import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getPlayer } from '../PlayerManager';
import { infoEmbed, errorEmbed } from '../utils/embeds';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
  .setName('remove')
  .setDescription('Remove a track from the queue by its position.')
  .addIntegerOption((opt) =>
    opt
      .setName('position')
      .setDescription('1-based position in the queue')
      .setMinValue(1)
      .setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const player = getPlayer(interaction.guildId);
  if (!player) {
    await interaction.reply({ embeds: [errorEmbed('The bot is not in a voice channel.')], ephemeral: true });
    return;
  }

  const pos = interaction.options.getInteger('position', true);
  const removed = player.queue.removeAt(pos);

  if (!removed) {
    await interaction.reply({ embeds: [errorEmbed(`No track at position **${pos}**.`)], ephemeral: true });
    return;
  }

  await interaction.reply({ embeds: [infoEmbed(`🗑️ Removed **${removed.title}** from the queue.`)] });
}

export default { data, execute } satisfies Command;
