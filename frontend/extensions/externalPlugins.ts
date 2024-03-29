import type { PluginModule } from '@rokii/types';

import debounce from 'just-debounce';
import { watch } from 'chokidar';
import { parse } from 'path';
import { initPlugin } from '@/services/plugins/initializePlugins';
import {
  ensureRokiNeededFiles,
  pluginSettings
} from '@/services/plugins';
import { PLUGINS_NODE_MODULES_PATH } from '@/constants';

const plugins: Record<string, PluginModule> = {};

const requirePlugin = (pluginPath: string) => {
  try {
    const plugin = window.require(pluginPath);

    // Fallback for plugins with structure like `{default: {fn: ...}}`
    const keys = Object.keys(plugin);
    if (keys.length === 1 && keys.includes('default')) {
      return plugin.default;
    }

    return plugin;
  } catch (error) {
    // catch all errors from plugin loading
    console.log('Error requiring', pluginPath);
    console.log(error);
  }
};

/**
 * Validate plugin module signature
 */
const isPluginValid = (plugin: PluginModule) =>
  plugin &&
  // Check existing of main plugin function
  typeof plugin.fn === 'function' &&
  // Check that plugin function accepts 0 or 1 argument
  plugin.fn.length <= 1;

ensureRokiNeededFiles();

/* As we support scoped plugins, using 'base' as plugin name is no longer valid
  because it is not unique. '@example/plugin' and '@test/plugin' would both be treated as 'plugin'
  So now we must introduce the scope to the plugin name
  This function returns the name with the scope if it is present in the path
*/
const getPluginName = (pluginPath: string) => {
  const { base, dir } = parse(pluginPath);
  const scope = dir.match(/@.+$/);
  if (!scope) return base;
  return `${scope[0]}/${base}`;
};

const setupPluginsWatcher = () => {
  if ((window as any).isBackground) return;

  const pluginsWatcher = watch(PLUGINS_NODE_MODULES_PATH, { depth: 1 });
  pluginsWatcher.on('unlinkDir', (pluginPath) => {
    const { base, dir } = parse(pluginPath);
    if (base.match(/node_modules/) || base.match(/^@/)) return;
    if (!dir.match(/node_modules$/) && !dir.match(/@.+$/)) return;

    const pluginName = getPluginName(pluginPath);

    const requirePath = window.require.resolve(pluginPath);
    delete plugins[pluginName];
    delete window.require.cache[requirePath];
    console.log(`[${pluginName}] Plugin removed`);
  });

  pluginsWatcher.on('addDir', (pluginPath) => {
    const { base, dir } = parse(pluginPath);

    if (base.match(/node_modules/) || base.match(/^@/)) return;
    if (!dir.match(/node_modules$/) && !dir.match(/@.+$/)) return;

    const pluginName = getPluginName(pluginPath);

    setTimeout(() => {
      console.group(`Load plugin: ${pluginName}`);
      console.log(`Path: ${pluginPath}...`);
      const plugin = requirePlugin(pluginPath);
      if (!isPluginValid(plugin)) {
        console.log('Plugin is not valid, skipped');
        console.groupEnd();
        return;
      }
      if (!pluginSettings.validate(plugin)) {
        console.log('Invalid plugins settings');
        console.groupEnd();
        return;
      }

      console.log('Loaded.');
      const requirePath = window.require.resolve(pluginPath);
      const watcher = watch(pluginPath, { depth: 0 });
      watcher.on(
        'change',
        debounce(() => {
          console.log(`[${pluginName}] Update plugin`);
          delete window.require.cache[requirePath];
          plugins[pluginName] = window.require(pluginPath) as PluginModule;
          console.log(`[${pluginName}] Plugin updated`);
        }, 1000)
      );
      plugins[pluginName] = plugin as PluginModule;
      initPlugin(plugin, pluginName);
      console.groupEnd();
    }, 20);
  });
};

setupPluginsWatcher();

export default plugins;
