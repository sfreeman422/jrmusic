export interface TrackOptions {
  url: string;
  title: string;
  duration: string;
  requester: string;
  thumbnail?: string | null;
}

/**
 * Represents a single item in the music queue.
 */
export class Track {
  public readonly url: string;
  public readonly title: string;
  public readonly duration: string;
  public readonly requester: string;
  public readonly thumbnail: string | null;

  constructor({ url, title, duration, requester, thumbnail = null }: TrackOptions) {
    this.url = url;
    this.title = title;
    this.duration = duration;
    this.requester = requester;
    this.thumbnail = thumbnail ?? null;
  }

  toString(): string {
    return `**${this.title}** (${this.duration}) — requested by ${this.requester}`;
  }
}

/**
 * Manages a guild's music queue and playback state.
 */
export class MusicQueue {
  public tracks: Track[] = [];
  public loop = false;
  public volume = 1.0;

  /** Add a track to the end of the queue. */
  enqueue(track: Track): void {
    this.tracks.push(track);
  }

  /**
   * Remove and return the next track.
   * When loop mode is active the track is re-added to the end.
   */
  dequeue(): Track | undefined {
    if (this.loop && this.tracks.length > 0) {
      const track = this.tracks.shift()!;
      this.tracks.push(track);
      return track;
    }
    return this.tracks.shift();
  }

  /** Peek at the current (first) track without removing it. */
  peek(): Track | undefined {
    return this.tracks[0];
  }

  /** Remove all tracks from the queue. */
  clear(): void {
    this.tracks = [];
  }

  get isEmpty(): boolean {
    return this.tracks.length === 0;
  }

  get size(): number {
    return this.tracks.length;
  }

  /**
   * Remove the track at the given 1-based user-facing index.
   * Returns null when the index is out of range.
   */
  removeAt(index: number): Track | null {
    if (index < 1 || index > this.tracks.length) return null;
    const [removed] = this.tracks.splice(index - 1, 1);
    return removed ?? null;
  }

  /** Shuffle the queue, preserving the first (next-up) track. */
  shuffle(): void {
    if (this.tracks.length < 2) return;
    const first = this.tracks.shift()!;
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tracks[i], this.tracks[j]] = [this.tracks[j]!, this.tracks[i]!];
    }
    this.tracks.unshift(first);
  }
}
