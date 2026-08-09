import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getPlayer } from '../PlayerManager';
import { nowPlayingEmbed, errorEmbed } from '../utils/embeds';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
  .setName('nowplaying')
  .setDescription('Show information about the currently playing track.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const track = getPlayer(interaction.guildId)?.getNowPlaying();

  if (!track) {
    await interaction.reply({ embeds: [errorEmbed('Nothing is playing right now.')], ephemeral: true });
    return;
  }

  await interaction.reply({ embeds: [nowPlayingEmbed(track)] });
}

export default { data, execute } satisfies Command;
