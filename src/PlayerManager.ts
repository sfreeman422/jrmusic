import { Guild, VoiceBasedChannel, TextBasedChannel } from 'discord.js';
import { joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { Player } from './Player';

/** Maps guildId → Player instance. */
const players = new Map<string, Player>();

/**
 * Get or create a Player for the guild, joining the voice channel if needed.
 */
export async function getOrCreatePlayer(
  guild: Guild,
  voiceChannel: VoiceBasedChannel,
  textChannel: TextBasedChannel,
): Promise<Player> {
  let player = players.get(guild.id);

  if (!player || player.connection.state.status === VoiceConnectionStatus.Destroyed) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });

    player = new Player(connection);
    player.textChannel = textChannel;
    players.set(guild.id, player);
    await player.connect();
  }

  return player;
}

/** Retrieve an existing Player without creating one. */
export function getPlayer(guildId: string | null): Player | undefined {
  if (!guildId) return undefined;
  return players.get(guildId);
}

/** Destroy the Player for a guild and remove it from the map. */
export function destroyPlayer(guildId: string | null): void {
  if (!guildId) return;
  const player = players.get(guildId);
  if (player) {
    player.destroy();
    players.delete(guildId);
  }
}
