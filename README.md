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

---

## Self-Hosting Guide

### Step 1 — Prerequisites

Make sure the following are installed on your host machine before you do anything else:

- **Node.js 18 or later** — [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** — [git-scm.com](https://git-scm.com/)

> FFmpeg is **not** required as a system dependency — it is bundled automatically via the `ffmpeg-static` npm package.

Verify your setup:

```bash
node --version   # should print v18.x.x or higher
npm --version
git --version
```

---

### Step 2 — Create a Discord Application & Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. Give it a name (e.g. `jrmusic`), then open the **Bot** tab.
3. Click **Add Bot** → **Yes, do it!**
4. Under the bot's username, click **Reset Token**, copy the token, and keep it safe — you will need it in Step 4.
5. Scroll down and enable the following **Privileged Gateway Intents**:
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`
6. Go to the **OAuth2 → General** tab and copy the **Client ID** — you will also need it in Step 4.

#### Invite the bot to your server

1. Go to **OAuth2 → URL Generator**.
2. Under **Scopes**, check:
   - `bot`
   - `applications.commands`
3. Under **Bot Permissions**, check:
   - `Send Messages`
   - `Embed Links`
   - `Connect`
   - `Speak`
   - `Use Voice Activity`
4. Copy the generated URL, open it in your browser, and select the server you want to add the bot to.

---

### Step 3 — (Optional) Create a Spotify App

Spotify support is **optional**. Skip this step if you only need YouTube/search playback.

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. Click **Create App**, fill in the name and description.
3. Open the app and copy the **Client ID** and **Client Secret** — you will need them in Step 4.

---

### Step 4 — Clone and Configure

```bash
git clone https://github.com/sfreeman422/jrmusic.git
cd jrmusic
npm install
```

Copy the example environment file and fill it in:

```bash
cp .env.example .env
```

Open `.env` in your editor and set the following values:

| Variable | Required | Where to find it |
|---|---|---|
| `DISCORD_TOKEN` | ✅ | Bot token from Step 2 |
| `DISCORD_CLIENT_ID` | ✅ | Application Client ID from Step 2 |
| `DISCORD_GUILD_ID` | ❌ | Right-click your server in Discord → **Copy Server ID** (enable Developer Mode in Discord settings first). Set this for instant slash command registration in one server; leave blank to register globally (takes up to 1 hour). |
| `SPOTIFY_CLIENT_ID` | ❌ | Spotify Client ID from Step 3 |
| `SPOTIFY_CLIENT_SECRET` | ❌ | Spotify Client Secret from Step 3 |

Example `.env`:

```env
DISCORD_TOKEN=MTExxx...your_token_here
DISCORD_CLIENT_ID=123456789012345678
DISCORD_GUILD_ID=987654321098765432
SPOTIFY_CLIENT_ID=abc123...
SPOTIFY_CLIENT_SECRET=def456...
```

---

### Step 5 — Build

Compile the TypeScript source to JavaScript:

```bash
npm run build
```

Output is written to `dist/`. You must rebuild any time you change source files.

---

### Step 6 — Register Slash Commands

Run this **once** (or again any time you add/change commands):

```bash
npm run deploy
```

- If `DISCORD_GUILD_ID` is set → commands appear in that server **immediately**.
- If `DISCORD_GUILD_ID` is blank → global registration, propagates within **up to 1 hour**.

---

### Step 7 — Start the Bot

```bash
npm start
```

You should see a `Logged in as jrmusic#XXXX` message. The bot is now live. Join a voice channel in your Discord server and try `/play`.

---

## Keeping the Bot Running in Production

`npm start` works fine for testing, but you probably want the bot to restart automatically if it crashes or if the server reboots. Choose one of the options below.

### Option A — PM2 (recommended, simplest)

[PM2](https://pm2.keymetrics.io/) is a Node.js process manager.

```bash
# Install PM2 globally
npm install -g pm2

# Start the bot and give the process a name
pm2 start dist/index.js --name jrmusic

# Save the process list so it restarts on reboot
pm2 save

# Enable PM2 to start on system boot (follow the printed instructions)
pm2 startup
```

Useful PM2 commands:

```bash
pm2 status          # show running processes
pm2 logs jrmusic    # tail logs
pm2 restart jrmusic # restart after a rebuild
pm2 stop jrmusic    # stop the bot
pm2 delete jrmusic  # remove from PM2
```

### Option B — systemd (Linux servers)

Create a service file at `/etc/systemd/system/jrmusic.service`:

```ini
[Unit]
Description=jrmusic Discord bot
After=network.target

[Service]
Type=simple
User=YOUR_LINUX_USER
WorkingDirectory=/path/to/jrmusic
EnvironmentFile=/path/to/jrmusic/.env
ExecStart=/usr/bin/node /path/to/jrmusic/dist/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Then enable and start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable jrmusic
sudo systemctl start jrmusic
sudo systemctl status jrmusic   # confirm it's running
journalctl -u jrmusic -f        # tail logs
```

### Option C — Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist/ ./dist/
CMD ["node", "dist/index.js"]
```

Build the image **after** running `npm run build` locally:

```bash
npm run build
docker build -t jrmusic .
docker run -d --restart unless-stopped --env-file .env --name jrmusic jrmusic
```

---

## Updating

```bash
git pull
npm install        # pick up any new dependencies
npm run build      # recompile
npm run deploy     # only needed if commands changed
# then restart the bot (e.g. pm2 restart jrmusic)
```

---

## Running Tests

```bash
npm test
```

---

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
