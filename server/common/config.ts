import { ipcRenderer } from "electron";
import Store, { Schema } from "electron-store";
import { themes } from "./themes";

type settingsSchema = {
  locale: string;
  lang: string;
  country: string;
  theme: string;
  hotkey: string;
  showInTray: boolean;
  firstStart: boolean;
  developerMode: boolean;
  cleanOnHide: boolean;
  selectOnShow: boolean;
  hideOnBlur: boolean;
  plugins: Record<string, unknown>;
  isMigratedPlugins: boolean;
  openAtLogin: boolean;
  winPosition: [x: number, y: number];
  proxy?: string;
};

const schema: Schema<settingsSchema> = {
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
function get<T extends keyof settingsSchema>(key: T): settingsSchema[T] {
  return store.get(key);
}

/**
 * Write a value to global config. It immedately rewrites global config
 * and notifies all listeners about changes
 *
 */
function set<T extends keyof settingsSchema>(key: T, value: settingsSchema[T]) {
  store.set(key, value);
  if (ipcRenderer) {
    console.log("notify main process", key, value);
    // Notify main process about settings changes
    ipcRenderer.send("updateSettings", key, value);
  }
}

export { get, set };
