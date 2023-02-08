import { send } from "@/services/rpc";
import { settings as pluginSettings } from "@/services/plugins";

/**
 * Initialices plugin sync and/or async by calling the `initialize` and `initializeAsync` functions
 */
const initPlugin = (plugin: any, name: string) => {
  const { initialize, initializeAsync } = plugin;

  // Foreground plugin initialization
  if (initialize) {
    console.log("Initialize sync plugin", name);
    try {
      initialize(pluginSettings.getUserSettings(plugin, name));
    } catch (e) {
      console.error(`Failed to initialize plugin: ${name}`, e);
    }
  }

  // Background plugin initialization
  if (initializeAsync) {
    console.log("Initialize async plugin", name);
    send("initializePluginAsync", { name });
  }
};

export { initPlugin };
