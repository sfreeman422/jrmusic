import fs from 'fs';
import path from 'path';
import { Collection } from 'discord.js';
import { Command } from './types';

/**
 * Load all commands from the compiled commands directory.
 */
export function loadCommands(): Collection<string, Command> {
  const commands = new Collection<string, Command>();
  const commandsPath = path.join(__dirname, 'commands');
  const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const command = require(path.join(commandsPath, file)) as Partial<Command>;
    if (command.data && command.execute) {
      commands.set((command.data as { name: string }).name, command as Command);
    }
  }

  return commands;
}
