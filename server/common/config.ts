import type { SettingsSchema } from "@rokii/types";
import Store, { Schema } from "electron-store";
import { CHANNELS } from "./constants/events";
import { themes } from "./themes";
import { send } from "./ipc";

const schema: Schema<SettingsSchema> = {
  locale: { default: "en-US" },
  lang: { default: "en" },
  country: { default: "US" },
  theme: { default: themes[0].value },
  hotkey: { default: "Control+Space" },
  showInTray: { default: true },
  firstStart: { default: true },
  developerMode: { default: false },
  cleanOnHide: { default: true },
  selectOnShow: { default: false },
  hideOnBlur: { default: true },
  plugins: { default: {} },
  isMigratedPlugins: { default: false },
  openAtLogin: { default: true },
  winPosition: { default: [] },
  proxy: { default: "" },
};

const store = new Store({
  schema,
  clearInvalidConfig: true,
});

/**
 * Get a value from global configuration
 */
function get<T extends keyof SettingsSchema>(key: T): SettingsSchema[T] {
  return store.get(key);
}

/**
 * Write a value to global config. It immedately rewrites global config
 * and notifies all listeners about changes
 *
 */
function set<T extends keyof SettingsSchema>(settingName: T, newValue: SettingsSchema[T]) {
  store.set(settingName, newValue);

  // Notify all processes about settings changes
  console.log("notify settings change", { settingName, newValue });
  send(CHANNELS.UpdateSettings, { settingName, newValue });
}

export { get, set };
