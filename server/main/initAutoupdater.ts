import type { BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";

const event = "update-downloaded";

const TEN_SECONDS_IN_MS = 10 * 1000;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export function initAutoUpdater(w: BrowserWindow) {
  if (process.env.NODE_ENV === "development" || process.platform === "linux") {
    return;
  }

  autoUpdater.on(event, (payload) => {
    w.webContents.send("message", {
      message: event,
      payload,
    });
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, TEN_SECONDS_IN_MS);

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, ONE_HOUR_IN_MS);
}
