import { scripts } from '@/extensions/scripts/Rokii';
import { join } from 'node:path';
import { readFileSync } from 'fs-extra';
import { FSWatcher, watch } from 'chokidar';
import { ROKII_PATH } from '@/constants';
import { Script } from './types';

class ScriptsWatcher {
  private customScripts: Script[] = [];
  private watcher: FSWatcher | undefined;
  private nativeScripts: Script[] = scripts;

  constructor () {
    this.watch();
  }

  private watch () {
    if (this.watcher) return;

    const watcher = watch(join(ROKII_PATH, 'scripts', 'custom.json'), {
      awaitWriteFinish: true
    });

    watcher.on('all', (e, path) => {
      console.log('[ScriptsWatcher] - Event: ', e, path);
      this.customScripts = JSON.parse(readFileSync(path, 'utf-8'));
      console.log('[ScriptsWatcher] - Updating commands...');
    });
  }

  getScripts () {
    return [...this.nativeScripts, ...this.customScripts];
  }
}

export const scriptsWatcher = new ScriptsWatcher();
