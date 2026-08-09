import { EmbedBuilder } from 'discord.js';
import { Track } from '../MusicQueue';

/** Accent colour used across all embeds. */
const COLOR = 0x1db954; // Spotify green – looks good universally

/** Build a "Now Playing" embed. */
export function nowPlayingEmbed(track: Track): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('🎵 Now Playing')
    .setDescription(track.toString());

  if (track.thumbnail) {
    embed.setThumbnail(track.thumbnail);
  }

  return embed;
}

/** Build a "Added to Queue" embed. */
export function queuedEmbed(track: Track, position: number): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('✅ Added to Queue')
    .setDescription(`${track.toString()}\n**Position:** ${position}`);
}

/** Build a paginated queue embed. */
export function queueListEmbed(
  tracks: Track[],
  nowPlaying: Track | null,
  page = 1,
): EmbedBuilder {
  const PAGE_SIZE = 10;
  const start = (page - 1) * PAGE_SIZE;
  const slice = tracks.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(tracks.length / PAGE_SIZE));

  const lines = slice.map((t, i) => `\`${start + i + 1}.\` ${t.toString()}`);

  return new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('📋 Queue')
    .setDescription(
      [
        nowPlaying ? `**Now Playing:** ${nowPlaying.toString()}` : '',
        lines.length ? lines.join('\n') : '_The queue is empty._',
      ]
        .filter(Boolean)
        .join('\n\n'),
    )
    .setFooter({ text: `Page ${page}/${totalPages} • ${tracks.length} track(s) in queue` });
}

/** Build a simple info embed. */
export function infoEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder().setColor(COLOR).setDescription(message);
}

/** Build an error embed. */
export function errorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder().setColor(0xe74c3c).setDescription(`❌ ${message}`);
}
