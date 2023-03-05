import { BrowserWindow, globalShortcut } from "electron";
import { CHANNELS } from "../../common/constants/events";
import * as ipc from "../../common/ipc";
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
      (enabled) => newValue !== enabled ? setAutoStart(newValue) : undefined
    );
  },

  hotkey: (newValue: string, { win }) => {
    globalShortcut.unregisterAll();
    globalShortcut.register(newValue, () => toggleWindow(win));
  },

  theme: (newValue: string) => {
    ipc.send(CHANNELS.UpdateTheme, newValue);
  },

  proxy: (newValue: string, { win }) => {
    win.webContents.session.setProxy({ proxyRules: newValue });
  }
};

const setupSettingsListener = (args: SettingsListenerOptions) => {
  ipc.on(CHANNELS.UpdateSettings, (_, { settingName, newValue }) => {
    if (settingName in SETTING_HANDLERS) {
      SETTING_HANDLERS[settingName](newValue, args);
    }
  });
};

export { setupSettingsListener };
