import { client } from "@/services/plugins";
import * as config from "common/config";
import loadPlugins from "./loadPlugins";
import getInstalledPlugins from "./getInstalledPlugins";

const OS_APPS_PLUGIN = {
  darwin: "@cerebroapp/cerebro-mac-apps",
  DEFAULT: "@cerebroapp/cerebro-basic-apps",
} as const;

const DEFAULT_PLUGINS = [
  OS_APPS_PLUGIN[process.platform as keyof typeof OS_APPS_PLUGIN] ||
    OS_APPS_PLUGIN.DEFAULT,
  "@cerebroapp/search",
  "cerebro-math",
  "cerebro-converter",
  "cerebro-open-web",
  "cerebro-files-nav",
];

/**
 * Check plugins for updates and start plugins autoupdater
 */
async function checkForUpdates() {
  console.log("Run plugins autoupdate");
  const plugins = await loadPlugins();

  const updatePromises = plugins
    .filter((p) => p.isUpdateAvailable)
    .map((p) => () => client.update(p.name));

  await Promise.all(updatePromises);

  console.log(
    updatePromises.length > 0
      ? `${updatePromises.length} plugins are updated`
      : "All plugins are up to date"
  );

  // Run autoupdate every 12 hours
  setTimeout(checkForUpdates, 12 * 60 * 60 * 1000);
}

/**
 * Migrate plugins: default plugins were extracted to separate packages
 * so if default plugins are not installed – start installation
 */
async function migratePlugins(sendMessage: Function) {
  if (config.get("isMigratedPlugins")) {
    // Plugins are already migrated
    return;
  }

  console.log("Start installation of default plugins");
  const installedPlugins = await getInstalledPlugins();

  const promises = DEFAULT_PLUGINS.filter(
    (plugin) => !installedPlugins[plugin]
  ).map((plugin) => () => client.install(plugin));

  if (promises.length > 0) {
    sendMessage("plugins:start-installation");
  }

  Promise.all(promises).then(() => {
    console.log("All default plugins are installed!");
    config.set("isMigratedPlugins", true);
    sendMessage("plugins:finish-installation");
  });
}

export default async (sendMessage: Function) => {
  checkForUpdates();
  migratePlugins(sendMessage);
};
