import { client } from "@/services/plugins";
import * as config from "common/config";
import loadPlugins from "./loadPlugins";
import { getInstalledPlugins } from "./getInstalledPlugins";

const DEFAULT_PLUGINS = [
  process.platform === "darwin" ? "@cerebroapp/cerebro-mac-apps" : "@cerebroapp/cerebro-basic-apps",
  "@cerebroapp/search",
  "cerebro-math",
  "cerebro-converter",
  "cerebro-open-web",
  "cerebro-files-nav",
] as const;

/**
 * Check plugins for updates and start plugins autoupdater
 */
async function checkForUpdates() {
  console.log("Run plugins autoupdate");
  const plugins = await loadPlugins();

  const updatePromises = plugins
    .filter((p) => p.isUpdateAvailable === true)
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
    (plugin) => !installedPlugins.find((p) => p.name === plugin)
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
