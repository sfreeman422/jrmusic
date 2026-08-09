import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getPlayer } from '../PlayerManager';
import { infoEmbed, errorEmbed } from '../utils/embeds';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skip the currently playing track.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const player = getPlayer(interaction.guildId);
  if (!player || !player.getNowPlaying()) {
    await interaction.reply({ embeds: [errorEmbed('Nothing is playing right now.')], ephemeral: true });
    return;
  }

  const skipped = player.getNowPlaying()!;
  player.skip();
  await interaction.reply({ embeds: [infoEmbed(`⏭️ Skipped **${skipped.title}**.`)] });
}

export default { data, execute } satisfies Command;
