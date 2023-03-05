import { app, BrowserWindow, globalShortcut, shell } from "electron";
import { join } from "node:path";
import * as config from "../common/config";
import { INPUT_HEIGHT, WINDOW_WIDTH } from "../common/constants/ui";
import { toggleWindow } from "./services/toggleWindow";
import { blurListener, hideListener, moveListener } from "./windowListeners";

export function createMainWindow() {
  const [x, y] = config.get("winPosition");

  const win = new BrowserWindow({
    x,
    y,
    width: WINDOW_WIDTH,
    minWidth: WINDOW_WIDTH,
    height: INPUT_HEIGHT,
    frame: false,
    transparent: true,
    resizable: false,
    title: "RoKI",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    show: config.get("firstStart"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Workaround to set the position the first time (centers the window)
  config.set("winPosition", win.getPosition() as [number, number]);

  if (process.env.VITE_DEV_SERVER_URL) {
    const url = process.env.VITE_DEV_SERVER_URL;

    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexHtml = join(process.env.DIST, "index.html");
    win.loadFile(indexHtml);
  }

  configureListeners(win);

  return win;
}

const configureListeners = (mainWindow: BrowserWindow) => {
  // Get global shortcut from app settings
  let shortcut = config.get("hotkey");

  // Setup event listeners for main window
  globalShortcut.register(shortcut, () => toggleWindow(mainWindow));

  mainWindow.on("hide", () => hideListener());
  mainWindow.on("blur", () => blurListener(mainWindow));

  // Save window position when it is being moved
  mainWindow.on("move", () => moveListener(mainWindow));

  mainWindow.on("close", app.quit);

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      shell.openExternal(url);
      event.preventDefault();
    }
  });

  // Make all links open with the browser, not with the application
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
};
