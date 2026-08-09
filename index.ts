import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { loadCommands } from './src/commandLoader';
import { errorEmbed } from './src/utils/embeds';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

const commands = loadCommands();

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`[InteractionCreate] Error executing /${interaction.commandName}:`, err);
    const reply = { embeds: [errorEmbed('An unexpected error occurred.')], ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(reply).catch(() => undefined);
    } else {
      await interaction.reply(reply).catch(() => undefined);
    }
  }
});

const token = process.env['DISCORD_TOKEN'];
if (!token) {
  console.error(
    'DISCORD_TOKEN environment variable is not set. See README.md for setup instructions.',
  );
  process.exit(1);
}

void client.login(token);

export default client;
