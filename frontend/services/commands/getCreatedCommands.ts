import { join } from 'node:path';
import { readFileSync } from 'fs-extra';
import { watch } from 'chokidar';
import { ROKII_PATH } from '@/constants';
import { Command } from './types';

const watcher = watch(join(ROKII_PATH, 'commands', 'custom.json'), {
  awaitWriteFinish: true
});

let customCommands: Command[] = [];

watcher.on('all', (e, path) => {
  customCommands = JSON.parse(readFileSync(path, 'utf-8'));
});

export const getCreatedCommands = () => customCommands;
