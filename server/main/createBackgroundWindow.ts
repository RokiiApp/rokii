import { BrowserWindow } from "electron";
import { join } from "path";

const url = join(process.env.VITE_DEV_SERVER_URL, "worker.html");
const indexHtml = join(process.env.DIST, "worker.html");
export const createBackgroundWindow = () => {
  const backgroundWindow = new BrowserWindow({
    show: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    backgroundWindow.loadURL(url);
    // Open devTool if the app is not packaged
    backgroundWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    backgroundWindow.loadFile(indexHtml);
  }

  return backgroundWindow;
};
