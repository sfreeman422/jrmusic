'use strict';

const playdl = require('play-dl');
const { Track } = require('../MusicQueue');
const { formatDuration } = require('./formatDuration');

/**
 * Resolve a YouTube URL or search string to a Track.
 * @param {string} query - YouTube URL or plain search text.
 * @param {string} requester - Discord user tag.
 * @returns {Promise<Track>}
 */
async function resolveYouTube(query, requester) {
  let videoInfo;

  const urlType = await playdl.validate(query);

  if (urlType === 'yt_video') {
    const info = await playdl.video_info(query);
    videoInfo = info.video_details;
  } else if (urlType === 'yt_playlist') {
    throw new Error('Please use /playlist for playlist links.');
  } else {
    // Treat as a search query
    const results = await playdl.search(query, { source: { youtube: 'video' }, limit: 1 });
    if (!results || results.length === 0) {
      throw new Error(`No YouTube results found for: ${query}`);
    }
    videoInfo = results[0];
  }

  return new Track({
    url: videoInfo.url,
    title: videoInfo.title || 'Unknown Title',
    duration: formatDuration(videoInfo.durationInSec || 0),
    requester,
    thumbnail: videoInfo.thumbnails?.[0]?.url ?? null,
  });
}

/**
 * Resolve all videos in a YouTube playlist to an array of Tracks.
 * @param {string} playlistUrl
 * @param {string} requester
 * @returns {Promise<Track[]>}
 */
async function resolveYouTubePlaylist(playlistUrl, requester) {
  const playlist = await playdl.playlist_info(playlistUrl, { incomplete: true });
  const videos = await playlist.all_videos();
  return videos.map(
    (v) =>
      new Track({
        url: v.url,
        title: v.title || 'Unknown Title',
        duration: formatDuration(v.durationInSec || 0),
        requester,
        thumbnail: v.thumbnails?.[0]?.url ?? null,
      }),
  );
}

module.exports = { resolveYouTube, resolveYouTubePlaylist };

