import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  VoiceConnection,
  VoiceConnectionStatus,
  entersState,
} from '@discordjs/voice';
import playdl from 'play-dl';
import { TextBasedChannel } from 'discord.js';
import { MusicQueue, Track } from './MusicQueue';

/**
 * Manages voice connection and audio playback for a single guild.
 */
export class Player {
  public readonly connection: VoiceConnection;
  public readonly queue: MusicQueue;
  /** The text channel used to send playback notifications. */
  public textChannel: TextBasedChannel | null = null;

  private readonly audioPlayer: AudioPlayer;
  private nowPlaying: Track | null = null;
  private stopped = false;
  private resource: AudioResource | null = null;

  constructor(connection: VoiceConnection) {
    this.connection = connection;
    this.queue = new MusicQueue();
    this.audioPlayer = createAudioPlayer();

    this.connection.subscribe(this.audioPlayer);

    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      if (!this.stopped) {
        void this.playNext();
      }
    });

    this.audioPlayer.on('error', (err) => {
      console.error('[Player] AudioPlayer error:', err.message);
      if (!this.stopped) {
        void this.playNext();
      }
    });
  }

  /** Wait until the voice connection is ready. */
  async connect(): Promise<void> {
    try {
      await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000);
    } catch {
      this.connection.destroy();
      throw new Error('Could not connect to voice channel within 30 seconds.');
    }
  }

  /** Enqueue a track and start playback if nothing is currently playing. */
  async play(track: Track): Promise<void> {
    this.queue.enqueue(track);
    if (this.audioPlayer.state.status === AudioPlayerStatus.Idle) {
      await this.playNext();
    }
  }

  /** Skip the current track. */
  skip(): void {
    this.audioPlayer.stop(true);
  }

  /** Pause playback. */
  pause(): void {
    this.audioPlayer.pause();
  }

  /** Resume playback. */
  resume(): void {
    this.audioPlayer.unpause();
  }

  /** Stop playback and clear the queue. */
  stop(): void {
    this.stopped = true;
    this.queue.clear();
    this.audioPlayer.stop(true);
    this.nowPlaying = null;
  }

  getNowPlaying(): Track | null {
    return this.nowPlaying;
  }

  /**
   * Set the playback volume (0.0–2.0).
   */
  setVolume(vol: number): void {
    this.queue.volume = vol;
    if (this.resource?.volume) {
      this.resource.volume.setVolume(vol);
    }
  }

  /** Pull the next track from the queue and start streaming it. */
  private async playNext(): Promise<void> {
    const track = this.queue.dequeue();
    if (!track) {
      this.nowPlaying = null;
      return;
    }

    this.nowPlaying = track;

    try {
      const streamInfo = await playdl.stream(track.url, { quality: 2 });
      this.resource = createAudioResource(streamInfo.stream, {
        inputType: streamInfo.type,
        inlineVolume: true,
      });
      this.resource.volume?.setVolume(this.queue.volume);
      this.audioPlayer.play(this.resource);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Player] Failed to create stream for', track.url, message);
      await this.playNext();
    }
  }

  /** Destroy the voice connection and release all resources. */
  destroy(): void {
    this.stop();
    try {
      this.connection.destroy();
    } catch {
      // already destroyed
    }
  }
}
