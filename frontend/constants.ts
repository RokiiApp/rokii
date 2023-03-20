import { join } from 'path';
import { app } from '@electron/remote';

/**
 * Base url of npm API
 */
export const NPM_API_BASE = 'https://registry.npmjs.org/';

export enum RPCEvents {
  PluginMessage = 'plugin-message',
  InitializePluginAsync = 'initialize-plugin-async',
}

export const ROKII_PATH = join(app.getPath('appData'), 'rokii');
export const PLUGINS_PATH = join(ROKII_PATH, 'plugins');
export const PLUGINS_NODE_MODULES_PATH = join(PLUGINS_PATH, 'node_modules');
export const PLUGINS_PACKAGE_JSON_PATH = join(PLUGINS_PATH, 'package.json');
