import path from "path";
import { lstatSync, readdirSync } from "fs";
import { MODULES_DIRECTORY } from "@/services/plugins";

const isSymlink = (file: string) =>
  lstatSync(path.join(MODULES_DIRECTORY, file)).isSymbolicLink();

const isScopeDir = (file: string) =>
  file.match(/^@/) &&
  lstatSync(path.join(MODULES_DIRECTORY, file)).isDirectory();

const getSymlinkedPluginsInFolder = (scope?: string) => {
  const files = scope
    ? readdirSync(path.join(MODULES_DIRECTORY, scope))
    : readdirSync(MODULES_DIRECTORY);
  return files.filter((name) =>
    isSymlink(scope ? path.join(scope, name) : name)
  );
};

const getNotScopedPluginNames = async () => getSymlinkedPluginsInFolder();

const getScopedPluginNames = async () => {
  // Get all scoped folders
  const scopeSubfolders = readdirSync(MODULES_DIRECTORY).filter(isScopeDir);

  // for each scope, get all plugins
  const scopeNames = scopeSubfolders
    .map((scope) => {
      const scopePlugins = getSymlinkedPluginsInFolder(scope);
      return scopePlugins.map((plugin) => `${scope}/${plugin}`);
    })
    .flat(); // flatten array of arrays

  return scopeNames;
};

/**
 * Get list of all plugins that are currently in debugging mode.
 * These plugins are symlinked by [create-cerebro-plugin](https://github.com/cerebroapp/create-cerebro-plugin)
 *
 */
export default async () => {
  const [notScoppedPluginNames, scopedPluginNames] = await Promise.all([
    getNotScopedPluginNames(),
    getScopedPluginNames(),
  ]);
  return [...notScoppedPluginNames, ...scopedPluginNames];
};
