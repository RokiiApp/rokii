// @ts-ignore
import memoize from "memoizee";
import validVersion from "semver/functions/valid";
import compareVersions from "semver/functions/gt";
import { getNPMPlugins } from "./getNPMPLugins";
import { getInstalledPlugins } from "./getInstalledPlugins";
import getDebuggingPlugins from "./getDebuggingPlugins";
import blacklist from "./blacklist";

const maxAge = 5 * 60 * 1000; // 5 minutes

const getAvailableNPMPlugins = memoize(getNPMPlugins, { maxAge });

const parseVersion = (version: string) =>
  validVersion((version || "").replace(/^\^/, "")) || "0.0.0";

export default async () => {
  const [available, installed, debuggingPlugins] = await Promise.all([
    getAvailableNPMPlugins(),
    getInstalledPlugins(),
    getDebuggingPlugins(),
  ]);

  const normalizedIntalledPlugins = installed.map((plugin) => {
    const { name, version, settings } = plugin;
    return {
      name,
      version,
      installedVersion: parseVersion(version),
      settings,
      isInstalled: true,
      isUpdateAvailable: false,
    }
  });

  const pluginsList = available.map((plugin) => {
    const installedPlugin = normalizedIntalledPlugins.find(p => p.name === plugin.name);

    if (!installedPlugin) return {
      ...plugin,
      isInstalled: false,
      isUpdateAvailable: false,
    };

    const { installedVersion } = installedPlugin;
    const isUpdateAvailable = compareVersions(plugin.version, parseVersion(installedVersion));

    return {
      ...plugin,
      ...installedPlugin,
      isInstalled: true,
      isUpdateAvailable,
    };
  });

  console.log("Debugging Plugins: ", debuggingPlugins);

  const listOfDebuggingPlugins = debuggingPlugins.map((name) => ({
    name,
    description: "",
    version: "dev",
    isDebugging: true,
    isInstalled: true,
    isUpdateAvailable: false,
  }));

  const pluginsListWithoutDebugging = pluginsList.filter(p =>
    listOfDebuggingPlugins.find(d => d.name === p.name) === undefined
  );

  const plugins = [
    ...pluginsListWithoutDebugging,
    ...listOfDebuggingPlugins,
  ];

  // .filter((plugin) => !blacklist.includes(plugin.name));

  return plugins;
};
