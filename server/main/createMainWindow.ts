import { app, BrowserWindow, globalShortcut, shell } from "electron";
import debounce from "just-debounce";
import { join } from "node:path";
import * as config from "../common/config";
import { toggleWindow } from "./services/togglewindow";

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

  configureListeners(win);

  return win;
}

const configureListeners = (mainWindow: BrowserWindow) => {
  // Get global shortcut from app settings
  let shortcut = config.get("hotkey");

  // Function to toggle main window
  const toggleMainWindow = () => toggleWindow(mainWindow);
  // Function to show main window
  const showMainWindow = () => {
    mainWindow.show();
    mainWindow.focus();
  };

  // Setup event listeners for main window
  globalShortcut.register(shortcut, toggleMainWindow);

  mainWindow.on("blur", () => {
    if (config.get("hideOnBlur")) {
      // Hide window on blur in production
      // In development we usually use developer tools that can blur a window
      mainWindow.hide();
    }
  });

  // Save window position when it is being moved
  mainWindow.on(
    "move",
    debounce(() => {
      if (!mainWindow.isVisible()) {
        return;
      }

      config.set("winPosition", mainWindow.getPosition());
    }, 100)
  );

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

  // // Change global hotkey if it is changed in app settings
  // mainWindow.settingsChanges.on('hotkey', (value) => {
  //   globalShortcut.unregister(shortcut)
  //   shortcut = value
  //   globalShortcut.register(shortcut, toggleMainWindow)
  // })

  // // Change theme css file
  // mainWindow.settingsChanges.on('theme', (value) => {
  //   mainWindow.webContents.send('message', {
  //     message: 'updateTheme',
  //     payload: value
  //   })
  // })

  // mainWindow.settingsChanges.on('proxy', (value) => {
  //   mainWindow.webContents.session.setProxy({
  //     proxyRules: value
  //   })
  // })
};
