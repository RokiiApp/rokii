import type { PluginInfo } from "../types";

/**
 * Remove unnecessary information from plugin description
 * like `Cerebro plugin for`
 */
const removeDescriptionNoise = (str?: string) =>
  (str || "").replace(/^cerebro\s?(plugin)?\s?(to|for)?/i, "");

/**
 * Remove unnecessary information from plugin name
 * like `cerebro-plugin-` or `cerebro-`
 */
const removeNameNoise = (str?: string) =>
  (str || "").replace(/^cerebro-(plugin)?-?/i, "");

function trim(string: string) {
  return string.replace(/^\s+|\s+$/g, "");
}
function words(string: string) {
  const pattern = /[^\s]+/g;
  return string.match(pattern) || [];
}
function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const name = (text = "") => {
  const name = removeNameNoise(text.toLowerCase());
  const cleanestName = trim(name);
  const pluginWords = words(cleanestName);
  return pluginWords.map(capitalize).join(" ");
};

export const description = (text = "") => {
  const description = removeDescriptionNoise(text.toLowerCase());
  const cleanestDescription = trim(description);
  return capitalize(cleanestDescription);
};

export const version = (plugin: PluginInfo) =>
  plugin.isUpdateAvailable
    ? `${plugin.installedVersion} → ${plugin.version}`
    : plugin.version;
