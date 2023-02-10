import "../loadEnv";
import { app, BrowserWindow } from "electron";
import { release } from "node:os";
import { createMainWindow } from "./createMainWindow";
import { initAutoUpdater } from "./initAutoupdater";
import { AppTray } from "./AppTray";
import { createBackgroundWindow } from "./createBackgroundWindow";
import { setupRTRCommunication } from "./services/setupInterRendererCommunication";
import { setupSettingsListener } from "./services/settingsListener";

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
let backgroundWin: BrowserWindow | null = null;

app.whenReady().then(async () => {
  win = createMainWindow();

  require("@electron/remote/main").initialize();

  require("@electron/remote/main").enable(win.webContents);

  backgroundWin = createBackgroundWindow();

  require("@electron/remote/main").enable(backgroundWin.webContents);

  initAutoUpdater(win);
  const tray = new AppTray({
    src: "src/assets/icon.png",
    isDev: process.env.NODE_ENV === "development",
    mainWindow: win,
  });

  tray.show();

  setupSettingsListener({ win, tray: null });
  setupRTRCommunication(win, backgroundWin);
});

app.on("window-all-closed", () => {
  win = null;
  backgroundWin = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    win = createMainWindow();
    backgroundWin = createBackgroundWindow();
  }
});
