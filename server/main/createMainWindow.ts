import { BrowserWindow, shell } from "electron";
import { join } from "node:path";
import * as config from "../common/config";

const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

export function createMainWindow() {
  const [x, y] = config.get("winPosition");

  const win = new BrowserWindow({
    x,
    y,
    width: 900,
    minWidth: 500,
    height: 400,
    frame: false,
    transparent: false,
    resizable: true,
    title: "Main window",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Workaround to set the position the first time (centers the window)
  config.set("winPosition", win.getPosition());

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  return win;
}

const configureListeners = (mainWindow: BrowserWindow) => {};
