import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getPlayer } from '../PlayerManager';
import { infoEmbed, errorEmbed } from '../utils/embeds';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pause the currently playing track.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const player = getPlayer(interaction.guildId);
  if (!player || !player.getNowPlaying()) {
    await interaction.reply({ embeds: [errorEmbed('Nothing is playing right now.')], ephemeral: true });
    return;
  }

  player.pause();
  await interaction.reply({ embeds: [infoEmbed('⏸️ Paused.')] });
}

export default { data, execute } satisfies Command;
