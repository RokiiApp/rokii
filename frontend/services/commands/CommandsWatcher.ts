import { FSWatcher, watch } from 'chokidar';
import { COMMANDS_PATH } from '@/constants';
import { CommandApiInfo, CommandInfo } from './types';
import { readFileSync } from 'fs-extra';
import { join } from 'path';

class CommandsWatcher {
  private customCommands: CommandInfo[] = [];
  private watcher: FSWatcher | undefined;
  private nativeCommands: CommandInfo[] = [];

  constructor () {
    this.watch();
  }

  private watch () {
    if (this.watcher) return;

    const watcher = watch(COMMANDS_PATH, { awaitWriteFinish: true, depth: 0 });

    watcher.on('addDir', (path) => {
      // Ignore the commands folder itself
      if (path.toLowerCase() === COMMANDS_PATH.toLowerCase()) return;

      const commands = this.getCommandsFromPackageJson(path);
      this.customCommands.push(...commands);
    });
  }

  private getCommandsFromPackageJson (extensionFolderPath: string) {
    const pkgJson = JSON.parse(readFileSync(join(extensionFolderPath, 'package.json'), 'utf8'));

    const commands = pkgJson.commands.map((command: CommandApiInfo) => ({
      title: command.title,
      subtitle: command.subtitle,
      path: join(extensionFolderPath, 'dist', command.name + '.js'),
      mode: command.mode
    }));

    return commands;
  }

  getCommands () {
    return [...this.nativeCommands, ...this.customCommands];
  }
}

export const commandsWatcher = new CommandsWatcher();
