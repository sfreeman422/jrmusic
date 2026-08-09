'use strict';

const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} = require('@discordjs/voice');
const playdl = require('play-dl');
const { MusicQueue } = require('./MusicQueue');

/**
 * Manages voice connection and audio playback for a single guild.
 */
class Player {
  /**
   * @param {import('@discordjs/voice').VoiceConnection} connection
   */
  constructor(connection) {
    this.connection = connection;
    this.queue = new MusicQueue();
    this.audioPlayer = createAudioPlayer();
    this.nowPlaying = null;
    this._stopped = false;

    // Subscribe the connection to the audio player
    this.connection.subscribe(this.audioPlayer);

    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      if (!this._stopped) {
        this._stopped = false; // ensure flag is clear before fetching next track
        this._playNext();
      }
    });

    this.audioPlayer.on('error', (err) => {
      console.error('[Player] AudioPlayer error:', err.message);
      if (!this._stopped) {
        this._playNext();
      }
    });
  }

  /**
   * Wait until the voice connection is ready, then start playback.
   */
  async connect() {
    try {
      await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000);
    } catch {
      this.connection.destroy();
      throw new Error('Could not connect to voice channel within 30 seconds.');
    }
  }

  /**
   * Enqueue a track and start playback if nothing is playing.
   * @param {import('./MusicQueue').Track} track
   */
  async play(track) {
    this.queue.enqueue(track);
    if (this.audioPlayer.state.status === AudioPlayerStatus.Idle) {
      await this._playNext();
    }
  }

  /** Skip the current track. */
  skip() {
    this.audioPlayer.stop(true);
  }

  /** Pause playback. */
  pause() {
    this.audioPlayer.pause();
  }

  /** Resume playback. */
  resume() {
    this.audioPlayer.unpause();
  }

  /** Stop playback and clear the queue. */
  stop() {
    this._stopped = true;
    this.queue.clear();
    this.audioPlayer.stop(true);
    this.nowPlaying = null;
  }

  /** @returns {import('./MusicQueue').Track|null} */
  getNowPlaying() {
    return this.nowPlaying;
  }

  /**
   * Set the volume (0.0 – 2.0).
   * @param {number} vol
   */
  setVolume(vol) {
    this.queue.volume = vol;
    if (this._resource && this._resource.volume) {
      this._resource.volume.setVolume(vol);
    }
  }

  /** Internal: pull the next track from the queue and start streaming it. */
  async _playNext() {
    const track = this.queue.dequeue();
    if (!track) {
      this.nowPlaying = null;
      return;
    }

    this.nowPlaying = track;

    try {
      const stream = await Player._createStream(track.url);
      this._resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true,
      });
      this._resource.volume.setVolume(this.queue.volume);
      this.audioPlayer.play(this._resource);
    } catch (err) {
      console.error('[Player] Failed to create stream for', track.url, err.message);
      this._playNext();
    }
  }

  /**
   * Resolve a URL or search query to an audio stream via play-dl.
   * @param {string} url
   * @returns {Promise<{stream: NodeJS.ReadableStream, type: StreamType}>}
   */
  static async _createStream(url) {
    const info = await playdl.stream(url, { quality: 2 });
    return info;
  }

  /** Destroy the voice connection and release resources. */
  destroy() {
    this.stop();
    try {
      this.connection.destroy();
    } catch {
      // already destroyed
    }
  }
}

module.exports = Player;
