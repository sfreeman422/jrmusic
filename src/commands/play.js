'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getOrCreatePlayer, destroyPlayer } = require('../PlayerManager');
const { resolveYouTube, resolveYouTubePlaylist } = require('../utils/youtube');
const { resolveSpotify } = require('../utils/spotify');
const { nowPlayingEmbed, queuedEmbed, infoEmbed, errorEmbed } = require('../utils/embeds');
const playdl = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist from YouTube, Spotify, or a search query.')
    .addStringOption((opt) =>
      opt
        .setName('query')
        .setDescription('YouTube URL / Spotify URL / search terms')
        .setRequired(true),
    ),

  /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member?.voice?.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [errorEmbed('You need to be in a voice channel first.')],
        ephemeral: true,
      });
    }

    const query = interaction.options.getString('query', true);
    await interaction.deferReply();

    try {
      const player = await getOrCreatePlayer(
        interaction.guild,
        voiceChannel,
        interaction.channel,
      );

      // Determine query type
      const urlType = await playdl.validate(query).catch(() => 'search');

      let tracks = [];

      if (urlType === 'sp_track' || urlType === 'sp_album' || urlType === 'sp_playlist') {
        tracks = await resolveSpotify(query, interaction.user.tag);
      } else if (urlType === 'yt_playlist') {
        tracks = await resolveYouTubePlaylist(query, interaction.user.tag);
      } else {
        // YouTube URL or plain search
        tracks = [await resolveYouTube(query, interaction.user.tag)];
      }

      if (tracks.length === 0) {
        return interaction.editReply({ embeds: [errorEmbed('No tracks found.')] });
      }

      for (const track of tracks) {
        await player.play(track);
      }

      if (tracks.length === 1) {
        const queueSize = player.queue.size;
        const isFirst = player.getNowPlaying()?.url === tracks[0].url;
        if (isFirst && queueSize <= 1) {
          return interaction.editReply({ embeds: [nowPlayingEmbed(tracks[0])] });
        }
        return interaction.editReply({
          embeds: [queuedEmbed(tracks[0], player.queue.size)],
        });
      }

      return interaction.editReply({
        embeds: [infoEmbed(`✅ Added **${tracks.length}** tracks to the queue.`)],
      });
    } catch (err) {
      console.error('[/play]', err);
      const reply = { embeds: [errorEmbed(err.message)] };
      if (interaction.deferred) {
        return interaction.editReply(reply);
      }
      return interaction.reply({ ...reply, ephemeral: true });
    }
  },
};
