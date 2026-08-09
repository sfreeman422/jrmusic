import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getPlayer } from '../PlayerManager';
import { infoEmbed, errorEmbed } from '../utils/embeds';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
  .setName('loop')
  .setDescription('Toggle queue loop mode on or off.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const player = getPlayer(interaction.guildId);
  if (!player) {
    await interaction.reply({ embeds: [errorEmbed('The bot is not in a voice channel.')], ephemeral: true });
    return;
  }

  player.queue.loop = !player.queue.loop;
  const status = player.queue.loop ? '🔁 Loop **enabled**.' : '➡️ Loop **disabled**.';
  await interaction.reply({ embeds: [infoEmbed(status)] });
}

export default { data, execute } satisfies Command;
