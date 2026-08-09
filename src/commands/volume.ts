import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getPlayer } from '../PlayerManager';
import { infoEmbed, errorEmbed } from '../utils/embeds';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
  .setName('volume')
  .setDescription('Set the playback volume (0–200).')
  .addIntegerOption((opt) =>
    opt
      .setName('level')
      .setDescription('Volume level from 0 to 200 (default: 100)')
      .setMinValue(0)
      .setMaxValue(200)
      .setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const player = getPlayer(interaction.guildId);
  if (!player) {
    await interaction.reply({ embeds: [errorEmbed('The bot is not in a voice channel.')], ephemeral: true });
    return;
  }

  const level = interaction.options.getInteger('level', true);
  player.setVolume(level / 100);
  await interaction.reply({ embeds: [infoEmbed(`🔊 Volume set to **${level}%**.`)] });
}

export default { data, execute } satisfies Command;
