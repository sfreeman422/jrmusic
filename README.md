# jrmusic

A self-hosted Discord music bot that streams audio from **YouTube**, **Spotify**, and other popular sources — similar to [Jockie Music](https://www.jockiemusic.com/).

## Features

| Command | Description |
|---|---|
| `/play <query>` | Play a YouTube URL, Spotify URL, or search query |
| `/skip` | Skip the current track |
| `/stop` | Stop playback, clear the queue, and disconnect |
| `/pause` | Pause the current track |
| `/resume` | Resume a paused track |
| `/nowplaying` | Show the currently playing track |
| `/queue [page]` | List the queue (paginated) |
| `/remove <position>` | Remove a track from the queue |
| `/shuffle` | Shuffle the remaining queue |
| `/loop` | Toggle queue loop mode |
| `/volume <0–200>` | Set the playback volume |
| `/clear` | Clear all queued tracks |

**Supported sources:**
- YouTube videos and playlists
- Spotify tracks, albums, and playlists (metadata resolved via Spotify API; audio streamed from YouTube)
- Any search query (resolved via YouTube)

## Prerequisites

- **Node.js 18+**
- **FFmpeg** (provided automatically via `ffmpeg-static`)
- A Discord bot application — create one at the [Discord Developer Portal](https://discord.com/developers/applications)
- *(Optional)* Spotify API credentials from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

## Setup

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/sfreeman422/jrmusic.git
   cd jrmusic
   npm install
   ```

2. **Create your environment file**

   ```bash
   cp .env.example .env
   ```

   Fill in the values:

   | Variable | Required | Description |
   |---|---|---|
   | `DISCORD_TOKEN` | ✅ | Bot token from the Discord Developer Portal |
   | `DISCORD_CLIENT_ID` | ✅ | Application (client) ID |
   | `DISCORD_GUILD_ID` | ❌ | Server ID for instant command registration (leave blank for global) |
   | `SPOTIFY_CLIENT_ID` | ❌ | Spotify app client ID |
   | `SPOTIFY_CLIENT_SECRET` | ❌ | Spotify app client secret |

3. **Register slash commands**

   ```bash
   npm run deploy
   ```

   If `DISCORD_GUILD_ID` is set, commands appear immediately in that server. Otherwise, global registration takes up to 1 hour.

4. **Start the bot**

   ```bash
   npm start
   ```

## Running Tests

```bash
npm test
```

## Bot Permissions

When inviting the bot to your server, make sure it has the following permissions:

- `Send Messages`
- `Embed Links`
- `Connect` (voice)
- `Speak` (voice)
- `Use Voice Activity`

Use the **OAuth2 URL Generator** in the Developer Portal with the `bot` and `applications.commands` scopes.

## Architecture

```
index.js              – Discord client, event routing
deploy-commands.js    – One-time slash command registration
src/
  MusicQueue.js       – Track model + queue management (loop, shuffle, remove)
  Player.js           – Voice connection + audio playback per guild
  PlayerManager.js    – Guild → Player map (create / get / destroy)
  commandLoader.js    – Dynamically loads all files in src/commands/
  commands/
    play.js           – /play  (YouTube, Spotify, search)
    skip.js           – /skip
    stop.js           – /stop
    pause.js          – /pause
    resume.js         – /resume
    nowplaying.js     – /nowplaying
    queue.js          – /queue
    remove.js         – /remove
    shuffle.js        – /shuffle
    loop.js           – /loop
    volume.js         – /volume
    clear.js          – /clear
  utils/
    youtube.js        – YouTube resolution via play-dl
    spotify.js        – Spotify → YouTube resolution via play-dl + Spotify API
    embeds.js         – Reusable Discord embed builders
tests/
  MusicQueue.test.js  – Unit tests for queue logic
  embeds.test.js      – Unit tests for embed builders
```
