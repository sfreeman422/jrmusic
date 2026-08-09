'use strict';

/**
 * Represents a single item in the music queue.
 */
class Track {
  /**
   * @param {object} options
   * @param {string} options.url        - Streamable URL.
   * @param {string} options.title      - Human-readable title.
   * @param {string} options.duration   - Human-readable duration (e.g. "3:45").
   * @param {string} options.requester  - Discord user tag who requested the track.
   * @param {string} [options.thumbnail] - Optional thumbnail URL.
   */
  constructor({ url, title, duration, requester, thumbnail = null }) {
    this.url = url;
    this.title = title;
    this.duration = duration;
    this.requester = requester;
    this.thumbnail = thumbnail;
  }

  toString() {
    return `**${this.title}** (${this.duration}) — requested by ${this.requester}`;
  }
}

/**
 * Manages a guild's music queue and playback state.
 */
class MusicQueue {
  constructor() {
    /** @type {Track[]} */
    this.tracks = [];
    this.loop = false;
    this.volume = 1.0;
  }

  /**
   * Add a track to the end of the queue.
   * @param {Track} track
   */
  enqueue(track) {
    this.tracks.push(track);
  }

  /**
   * Remove and return the next track.
   * When loop mode is active the track is re-added to the end.
   * @returns {Track|undefined}
   */
  dequeue() {
    if (this.loop && this.tracks.length > 0) {
      const track = this.tracks.shift();
      this.tracks.push(track);
      return track;
    }
    return this.tracks.shift();
  }

  /**
   * Peek at the current (first) track without removing it.
   * @returns {Track|undefined}
   */
  peek() {
    return this.tracks[0];
  }

  /** Remove all tracks from the queue. */
  clear() {
    this.tracks = [];
  }

  /** @returns {boolean} */
  get isEmpty() {
    return this.tracks.length === 0;
  }

  /** @returns {number} */
  get size() {
    return this.tracks.length;
  }

  /**
   * Remove the track at the given 1-based user-facing index.
   * @param {number} index
   * @returns {Track|null}
   */
  removeAt(index) {
    if (index < 1 || index > this.tracks.length) return null;
    const [removed] = this.tracks.splice(index - 1, 1);
    return removed;
  }

  /**
   * Shuffle the queue, preserving the first (next-up) track.
   */
  shuffle() {
    if (this.tracks.length < 2) return;
    const first = this.tracks.shift();
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
    }
    this.tracks.unshift(first);
  }
}

module.exports = { Track, MusicQueue };
