'use strict';

const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const Player = require('./Player');

/**
 * Maps guildId -> Player instance.
 * @type {Map<string, Player>}
 */
const players = new Map();

/**
 * Get or create a Player for the guild.  Joins the given voice channel if
 * no Player exists yet (or if the existing connection has been destroyed).
 *
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').VoiceBasedChannel} voiceChannel
 * @param {import('discord.js').TextBasedChannel} textChannel
 * @returns {Promise<Player>}
 */
async function getOrCreatePlayer(guild, voiceChannel, textChannel) {
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

/**
 * Retrieve an existing Player without creating one.
 * @param {string} guildId
 * @returns {Player|undefined}
 */
function getPlayer(guildId) {
  return players.get(guildId);
}

/**
 * Destroy the Player for a guild and remove it from the map.
 * @param {string} guildId
 */
function destroyPlayer(guildId) {
  const player = players.get(guildId);
  if (player) {
    player.destroy();
    players.delete(guildId);
  }
}

module.exports = { getOrCreatePlayer, getPlayer, destroyPlayer };
