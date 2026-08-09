import playdl, { YouTubeVideo } from 'play-dl';
import { Track } from '../MusicQueue';
import { formatDuration } from './formatDuration';

/**
 * Resolve a YouTube URL or search string to a Track.
 * @param query - YouTube URL or plain search text.
 * @param requester - Discord user tag.
 */
export async function resolveYouTube(query: string, requester: string): Promise<Track> {
  const urlType = await playdl.validate(query);

  let videoInfo: YouTubeVideo;

  if (urlType === 'yt_video') {
    const info = await playdl.video_info(query);
    videoInfo = info.video_details;
  } else if (urlType === 'yt_playlist') {
    throw new Error('Please use /playlist for playlist links.');
  } else {
    const results = await playdl.search(query, { source: { youtube: 'video' }, limit: 1 });
    if (!results || results.length === 0) {
      throw new Error(`No YouTube results found for: ${query}`);
    }
    videoInfo = results[0]!;
  }

  return new Track({
    url: videoInfo.url,
    title: videoInfo.title ?? 'Unknown Title',
    duration: formatDuration(videoInfo.durationInSec ?? 0),
    requester,
    thumbnail: videoInfo.thumbnails?.[0]?.url ?? null,
  });
}

/**
 * Resolve all videos in a YouTube playlist to an array of Tracks.
 */
export async function resolveYouTubePlaylist(
  playlistUrl: string,
  requester: string,
): Promise<Track[]> {
  const playlist = await playdl.playlist_info(playlistUrl, { incomplete: true });
  const videos = await playlist.all_videos();
  return videos.map(
    (v) =>
      new Track({
        url: v.url,
        title: v.title ?? 'Unknown Title',
        duration: formatDuration(v.durationInSec ?? 0),
        requester,
        thumbnail: v.thumbnails?.[0]?.url ?? null,
      }),
  );
}
