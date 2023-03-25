import { scripts } from '@/extensions/scripts/Rokii';
import { join } from 'node:path';
import { readFileSync } from 'fs-extra';
import { FSWatcher, watch } from 'chokidar';
import { ROKII_PATH } from '@/constants';
import { Script } from './types';

class CommandsWatcher {
  private customCommands: Script[] = [];
  private watcher: FSWatcher | undefined;
  private nativeCommands: Script[] = scripts;

  constructor () {
    this.watch();
  }

  private watch () {
    if (this.watcher) return;

    const watcher = watch(join(ROKII_PATH, 'commands', 'custom.json'), {
      awaitWriteFinish: true
    });

    watcher.on('all', (e, path) => {
      console.log('[CommandsWatcher] - Event: ', e, path);
      this.customCommands = JSON.parse(readFileSync(path, 'utf-8'));
      console.log('[CommandsWatcher] - Updating commands...');
    });
  }

  getCommands () {
    return [...this.nativeCommands, ...this.customCommands];
  }
}

export const scriptsWatcher = new CommandsWatcher();
