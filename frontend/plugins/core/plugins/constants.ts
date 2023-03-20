/**
 * Plugins that have been blacklisted.
 * The main purpose of this is to hide plugins that have been republished under our scope.
 * The name must match (case sensitive) the name in the `package.json`.
 */
export const PLUGINS_BLACKLIST = [
  'cerebro-basic-apps', // @cerebroapp/cerebro-basic-apps
  'cerebro-mac-apps', // @cerebroapp/cerebro-mac-apps
  'cerebro-brew' // @cerebroapp/cerebro-brew
] as readonly string[];

export const CACHE_PLUGINS_MAX_AGE = 5 * 60 * 1000; // 5 minutes
