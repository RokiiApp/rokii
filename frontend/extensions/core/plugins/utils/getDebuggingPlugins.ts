import { readdir } from 'fs/promises';
import { getSymlinkedPluginsInFolder, isScopeDir } from './fsUtils';
import { PLUGINS_NODE_MODULES_PATH } from '@/constants';

const getNotScopedPluginNames = async () => getSymlinkedPluginsInFolder();

const getScopedPluginNames = async () => {
  // Get all scoped folders
  const dirContent = await readdir(PLUGINS_NODE_MODULES_PATH);
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
