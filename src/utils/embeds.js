'use strict';

const { EmbedBuilder } = require('discord.js');

/** Accent colour used across all embeds. */
const COLOR = 0x1db954; // Spotify green – looks good universally

/**
 * Build a "Now Playing" embed.
 * @param {import('../MusicQueue').Track} track
 * @returns {EmbedBuilder}
 */
function nowPlayingEmbed(track) {
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('🎵 Now Playing')
    .setDescription(track.toString());

  if (track.thumbnail) {
    embed.setThumbnail(track.thumbnail);
  }

  return embed;
}

/**
 * Build a "Added to Queue" embed.
 * @param {import('../MusicQueue').Track} track
 * @param {number} position - 1-based position in queue
 * @returns {EmbedBuilder}
 */
function queuedEmbed(track, position) {
  return new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('✅ Added to Queue')
    .setDescription(`${track.toString()}\n**Position:** ${position}`);
}

/**
 * Build a paginated queue embed.
 * @param {import('../MusicQueue').Track[]} tracks
 * @param {import('../MusicQueue').Track|null} nowPlaying
 * @param {number} page - 1-based page number
 * @returns {EmbedBuilder}
 */
function queueListEmbed(tracks, nowPlaying, page = 1) {
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

/**
 * Build a simple info embed.
 * @param {string} message
 * @returns {EmbedBuilder}
 */
function infoEmbed(message) {
  return new EmbedBuilder().setColor(COLOR).setDescription(message);
}

/**
 * Build an error embed.
 * @param {string} message
 * @returns {EmbedBuilder}
 */
function errorEmbed(message) {
  return new EmbedBuilder().setColor(0xe74c3c).setDescription(`❌ ${message}`);
}

module.exports = { nowPlayingEmbed, queuedEmbed, queueListEmbed, infoEmbed, errorEmbed };
