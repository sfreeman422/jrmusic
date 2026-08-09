# jrmusic

A self-hosted Discord music bot written in **TypeScript** that streams audio from **YouTube**, **Spotify**, and other popular sources — similar to [Jockie Music](https://www.jockiemusic.com/).

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

3. **Build the TypeScript source**

   ```bash
   npm run build
   ```

   Compiled output is written to `dist/`. This step is run automatically by `npm start` and `npm run deploy`.

4. **Register slash commands**

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
index.ts              – Discord client, event routing
deploy-commands.ts    – One-time slash command registration
src/
  MusicQueue.ts       – Track model + queue management (loop, shuffle, remove)
  Player.ts           – Voice connection + audio playback per guild
  PlayerManager.ts    – Guild → Player map (create / get / destroy)
  commandLoader.ts    – Dynamically loads all files in src/commands/
  types.ts            – Shared TypeScript interfaces (Command)
  commands/
    play.ts           – /play  (YouTube, Spotify, search)
    skip.ts           – /skip
    stop.ts           – /stop
    pause.ts          – /pause
    resume.ts         – /resume
    nowplaying.ts     – /nowplaying
    queue.ts          – /queue
    remove.ts         – /remove
    shuffle.ts        – /shuffle
    loop.ts           – /loop
    volume.ts         – /volume
    clear.ts          – /clear
  utils/
    youtube.ts        – YouTube resolution via play-dl
    spotify.ts        – Spotify → YouTube resolution via play-dl + Spotify API
    embeds.ts         – Reusable Discord embed builders
    formatDuration.ts – Shared duration formatter
tests/
  MusicQueue.test.ts  – Unit tests for queue logic
  embeds.test.ts      – Unit tests for embed builders
dist/                 – Compiled JavaScript output (git-ignored)
```
