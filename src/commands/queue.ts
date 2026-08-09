import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getPlayer } from '../PlayerManager';
import { queueListEmbed, errorEmbed } from '../utils/embeds';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Show the current music queue.')
  .addIntegerOption((opt) =>
    opt.setName('page').setDescription('Page number').setMinValue(1),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const player = getPlayer(interaction.guildId);
  if (!player) {
    await interaction.reply({ embeds: [errorEmbed('The bot is not in a voice channel.')], ephemeral: true });
    return;
  }

  const page = interaction.options.getInteger('page') ?? 1;
  await interaction.reply({
    embeds: [queueListEmbed(player.queue.tracks, player.getNowPlaying(), page)],
  });
}

export default { data, execute } satisfies Command;
