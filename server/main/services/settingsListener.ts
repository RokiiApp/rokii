import { BrowserWindow, globalShortcut, ipcMain } from "electron";
import { AppTray } from "../AppTray";
import { isAutoStartEnabled, setAutoStart } from "../autoStart";
import { toggleWindow } from "./togglewindow";

type SettingsListenerOptions = {
  win: BrowserWindow;
  tray: AppTray;
};

type HandlerFunction = (value: any, args: SettingsListenerOptions) => any;

const SETTING_HANDLERS: Record<string, HandlerFunction> = {
  showInTray: (value: boolean, { tray }) => {
    value ? tray.show() : tray.hide();
  },

  developerMode: (value: boolean, { tray }) => {
    tray.setIsDev(value);
  },

  openAtLogin: (value: boolean) => {
    isAutoStartEnabled().then(
      (enabled) => value !== enabled && setAutoStart(value)
    );
  },

  hotkey: (value: string, { win }) => {
    globalShortcut.unregisterAll();
    globalShortcut.register(value, () => toggleWindow(win));
  },

  theme: (value: string, { win }) => {
    win.webContents.send("updateTheme", value);
  },

  proxy: (value: string, { win }) => {
    win.webContents.session.setProxy({ proxyRules: value });
  },
};

const setupSettingsListener = (args: SettingsListenerOptions) => {
  ipcMain.on("updateSettings", (_, settingName, value) => {
    SETTING_HANDLERS[settingName](value, args);
  });
};

export { setupSettingsListener };
