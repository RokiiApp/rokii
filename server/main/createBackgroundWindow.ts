import { BrowserWindow } from 'electron';
import { join } from 'path';

export const createBackgroundWindow = () => {
  const backgroundWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      contextIsolation: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    const url = join(process.env.VITE_DEV_SERVER_URL, 'worker.html');
    // electron-vite-vue#298
    backgroundWindow.loadURL(url);
    // Open devTool if the app is not packaged
    backgroundWindow.on('ready-to-show', () => backgroundWindow.webContents.openDevTools({ mode: 'detach' }));
  } else {
    const indexHtml = join(process.env.DIST, 'worker.html');
    backgroundWindow.loadFile(indexHtml);
  }

  return backgroundWindow;
};
