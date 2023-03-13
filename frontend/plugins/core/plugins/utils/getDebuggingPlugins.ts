import { readdir } from 'fs/promises';
import { MODULES_DIRECTORY } from '@/services/plugins';
import { getSymlinkedPluginsInFolder, isScopeDir } from './fsUtils';

const getNotScopedPluginNames = async () => getSymlinkedPluginsInFolder();

const getScopedPluginNames = async () => {
  // Get all scoped folders
  const dirContent = await readdir(MODULES_DIRECTORY);
  const scopeSubfolders = dirContent.filter(isScopeDir);

  const scopePluginsNamePromises = scopeSubfolders.map(async (scope) => {
    const symlinkedPlugins = await getSymlinkedPluginsInFolder(scope);
    return symlinkedPlugins.map((plugin) => `${scope}/${plugin}`);
  });

  const scopePluginNames = (await Promise.all(scopePluginsNamePromises)).flat();

  return scopePluginNames;
};

/**
 * Get list of all plugins that are currently in debugging mode.
 * These plugins are symlinked by [create-cerebro-plugin](https://github.com/cerebroapp/create-cerebro-plugin)
 */
export default async () => {
  const [notScoppedPluginNames, scopedPluginNames] = await Promise.all([
    getNotScopedPluginNames(),
    getScopedPluginNames()
  ]);
  return [...notScoppedPluginNames, ...scopedPluginNames];
};
