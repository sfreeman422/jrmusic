import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import playdl from 'play-dl';
import { getOrCreatePlayer } from '../PlayerManager';
import { resolveYouTube, resolveYouTubePlaylist } from '../utils/youtube';
import { resolveSpotify } from '../utils/spotify';
import { nowPlayingEmbed, queuedEmbed, infoEmbed, errorEmbed } from '../utils/embeds';
import { Track } from '../MusicQueue';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song or playlist from YouTube, Spotify, or a search query.')
  .addStringOption((opt) =>
    opt
      .setName('query')
      .setDescription('YouTube URL / Spotify URL / search terms')
      .setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const member = interaction.member as GuildMember | null;
  const voiceChannel = member?.voice?.channel ?? null;

  if (!voiceChannel) {
    await interaction.reply({
      embeds: [errorEmbed('You need to be in a voice channel first.')],
      ephemeral: true,
    });
    return;
  }

  const query = interaction.options.getString('query', true);
  await interaction.deferReply();

  try {
    const player = await getOrCreatePlayer(
      interaction.guild!,
      voiceChannel,
      interaction.channel!,
    );

    const urlType = await playdl.validate(query).catch(() => 'search' as const);

    let tracks: Track[] = [];

    if (urlType === 'sp_track' || urlType === 'sp_album' || urlType === 'sp_playlist') {
      tracks = await resolveSpotify(query, interaction.user.tag);
    } else if (urlType === 'yt_playlist') {
      tracks = await resolveYouTubePlaylist(query, interaction.user.tag);
    } else {
      tracks = [await resolveYouTube(query, interaction.user.tag)];
    }

    if (tracks.length === 0) {
      await interaction.editReply({ embeds: [errorEmbed('No tracks found.')] });
      return;
    }

    for (const track of tracks) {
      await player.play(track);
    }

    if (tracks.length === 1) {
      const isFirst = player.getNowPlaying()?.url === tracks[0]!.url;
      if (isFirst && player.queue.size <= 1) {
        await interaction.editReply({ embeds: [nowPlayingEmbed(tracks[0]!)] });
      } else {
        await interaction.editReply({ embeds: [queuedEmbed(tracks[0]!, player.queue.size)] });
      }
    } else {
      await interaction.editReply({
        embeds: [infoEmbed(`✅ Added **${tracks.length}** tracks to the queue.`)],
      });
    }
  } catch (err) {
    console.error('[/play]', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    const reply = { embeds: [errorEmbed(message)] };
    if (interaction.deferred) {
      await interaction.editReply(reply);
    } else {
      await interaction.reply({ ...reply, ephemeral: true });
    }
  }
}

export default { data, execute } satisfies Command;
