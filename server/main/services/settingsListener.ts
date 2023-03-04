import { BrowserWindow, globalShortcut, ipcMain } from "electron";
import { Events } from "../../common/constants/events";
import { AppTray } from "../AppTray";
import { isAutoStartEnabled, setAutoStart } from "../autoStart";
import { toggleWindow } from "./toggleWindow";

type SettingsListenerOptions = {
  win: BrowserWindow;
  tray: AppTray;
};

type HandlerFunction = (newValue: any, args: SettingsListenerOptions) => any;

const SETTING_HANDLERS: Record<string, HandlerFunction> = {
  showInTray: (newValue: boolean, { tray }) => {
    newValue ? tray.show() : tray.hide();
  },

  developerMode: (newValue: boolean, { tray }) => {
    tray.setIsDev(newValue);
  },

  openAtLogin: (newValue: boolean) => {
    isAutoStartEnabled().then(
      (enabled) => newValue !== enabled && setAutoStart(newValue)
    );
  },

  hotkey: (newValue: string, { win }) => {
    globalShortcut.unregisterAll();
    globalShortcut.register(newValue, () => toggleWindow(win));
  },

  theme: (newValue: string, { win }) => {
    win.webContents.send(Events.UpdateTheme, newValue);
  },

  proxy: (newValue: string, { win }) => {
    win.webContents.session.setProxy({ proxyRules: newValue });
  }
};

const setupSettingsListener = (args: SettingsListenerOptions) => {
  ipcMain.on(Events.UpdateSettings, (_, settingName, newValue) => {
    if (settingName in SETTING_HANDLERS) {
      SETTING_HANDLERS[settingName](newValue, args);
    }
  });
};

export { setupSettingsListener };
