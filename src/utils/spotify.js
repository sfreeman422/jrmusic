'use strict';

const playdl = require('play-dl');
const { Track } = require('../MusicQueue');
const { formatDuration } = require('./formatDuration');

/**
 * Resolve a Spotify track, album, or playlist URL to one or more Tracks by
 * searching YouTube for equivalent audio (same approach used by Jockie Music
 * and similar bots – the Spotify API provides metadata; YouTube provides audio).
 *
 * Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET env vars.
 *
 * @param {string} spotifyUrl
 * @param {string} requester
 * @returns {Promise<Track[]>}
 */
async function resolveSpotify(spotifyUrl, requester) {
  // Initialise Spotify credentials lazily
  await _ensureSpotifyAuth();

  const urlType = await playdl.validate(spotifyUrl);

  if (urlType === 'sp_track') {
    const data = await playdl.spotify(spotifyUrl);
    return [await _spotifyTrackToYouTubeTrack(data, requester)];
  }

  if (urlType === 'sp_album' || urlType === 'sp_playlist') {
    const data = await playdl.spotify(spotifyUrl);
    const tracks = data.fetched_tracks.get('1') || [];
    const resolved = [];
    for (const t of tracks) {
      try {
        resolved.push(await _spotifyTrackToYouTubeTrack(t, requester));
      } catch {
        // Skip unresolvable tracks in a playlist/album
      }
    }
    return resolved;
  }

  throw new Error('Unsupported Spotify URL type.');
}

/**
 * Search YouTube for the best match of a Spotify track object and return a Track.
 * @param {object} spotifyTrack - play-dl SpotifyTrack
 * @param {string} requester
 * @returns {Promise<Track>}
 */
async function _spotifyTrackToYouTubeTrack(spotifyTrack, requester) {
  const artists = spotifyTrack.artists?.map((a) => a.name).join(', ') ?? '';
  const query = `${artists} ${spotifyTrack.name}`.trim();

  const results = await playdl.search(query, { source: { youtube: 'video' }, limit: 1 });
  if (!results || results.length === 0) {
    throw new Error(`No YouTube results found for Spotify track: ${query}`);
  }
  const v = results[0];

  return new Track({
    url: v.url,
    title: `${spotifyTrack.name}${artists ? ' — ' + artists : ''}`,
    duration: formatDuration(spotifyTrack.durationInSec || v.durationInSec || 0),
    requester,
    thumbnail: spotifyTrack.thumbnail?.url ?? v.thumbnails?.[0]?.url ?? null,
  });
}

let _spotifyInitialised = false;

async function _ensureSpotifyAuth() {
  if (_spotifyInitialised) return;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables are required for Spotify support.',
    );
  }

  await playdl.setToken({
    spotify: {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: '',
      market: 'US',
    },
  });
  _spotifyInitialised = true;
}

module.exports = { resolveSpotify };

