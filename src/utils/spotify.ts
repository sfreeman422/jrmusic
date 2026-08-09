import playdl, { SpotifyTrack, SpotifyAlbum, SpotifyPlaylist } from 'play-dl';
import { Track } from '../MusicQueue';
import { formatDuration } from './formatDuration';

/**
 * Resolve a Spotify track, album, or playlist URL to one or more Tracks by
 * searching YouTube for equivalent audio.
 *
 * Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET env vars.
 */
export async function resolveSpotify(spotifyUrl: string, requester: string): Promise<Track[]> {
  await ensureSpotifyAuth();

  const urlType = await playdl.validate(spotifyUrl);

  if (urlType === 'sp_track') {
    const data = (await playdl.spotify(spotifyUrl)) as SpotifyTrack;
    return [await spotifyTrackToYouTubeTrack(data, requester)];
  }

  if (urlType === 'sp_album' || urlType === 'sp_playlist') {
    const data = (await playdl.spotify(spotifyUrl)) as SpotifyAlbum | SpotifyPlaylist;
    // fetched_tracks is populated after calling spotify(); cast through unknown to access it
    const rawTracks: SpotifyTrack[] =
      (data as unknown as { fetched_tracks: Map<string, SpotifyTrack[]> }).fetched_tracks.get(
        '1',
      ) ?? [];
    const resolved: Track[] = [];
    for (const t of rawTracks) {
      try {
        resolved.push(await spotifyTrackToYouTubeTrack(t, requester));
      } catch {
        // Skip unresolvable tracks in a playlist/album
      }
    }
    return resolved;
  }

  throw new Error('Unsupported Spotify URL type.');
}

async function spotifyTrackToYouTubeTrack(
  spotifyTrack: SpotifyTrack,
  requester: string,
): Promise<Track> {
  const artists =
    spotifyTrack.artists?.map((a: { name: string }) => a.name).join(', ') ?? '';
  const query = `${artists} ${spotifyTrack.name}`.trim();

  const results = await playdl.search(query, { source: { youtube: 'video' }, limit: 1 });
  if (!results || results.length === 0) {
    throw new Error(`No YouTube results found for Spotify track: ${query}`);
  }
  const v = results[0]!;

  return new Track({
    url: v.url,
    title: `${spotifyTrack.name}${artists ? ' — ' + artists : ''}`,
    duration: formatDuration(spotifyTrack.durationInSec ?? v.durationInSec ?? 0),
    requester,
    thumbnail: spotifyTrack.thumbnail?.url ?? v.thumbnails?.[0]?.url ?? null,
  });
}

let spotifyInitialised = false;

async function ensureSpotifyAuth(): Promise<void> {
  if (spotifyInitialised) return;
  const clientId = process.env['SPOTIFY_CLIENT_ID'];
  const clientSecret = process.env['SPOTIFY_CLIENT_SECRET'];

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
  spotifyInitialised = true;
}
