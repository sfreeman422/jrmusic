'use strict';

/**
 * deploy-commands.js
 *
 * Register slash commands with the Discord API.
 * Run once (or whenever commands change):
 *   node deploy-commands.js
 */

require('dotenv').config();

const { REST, Routes } = require('@discordjs/rest');
const { loadCommands } = require('./src/commandLoader');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID; // optional – leave blank for global registration

if (!token || !clientId) {
  console.error('DISCORD_TOKEN and DISCORD_CLIENT_ID must be set in your .env file.');
  process.exit(1);
}

const commands = loadCommands();
const commandData = [...commands.values()].map((c) => c.data.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Registering ${commandData.length} slash command(s)…`);

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandData });
      console.log(`✅ Guild commands registered for guild ${guildId}.`);
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commandData });
      console.log('✅ Global commands registered (may take up to 1 hour to propagate).');
    }
  } catch (err) {
    console.error('Failed to register commands:', err);
    process.exit(1);
  }
})();
