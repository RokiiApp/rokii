import { BrowserWindow, ipcMain } from "electron";
import { RTR_CHANNEL } from "../../common/constants/ui";

/**
 * As electron does not support communication between renderer processes,
 * we need to use this workaround. This function sets up the communication
 * between the main window and the background window.
 */
export const setupRTRCommunication = (
  win: BrowserWindow,
  backgroundWin: BrowserWindow
) => {
  ipcMain.on(RTR_CHANNEL, (event, payload) => {
    const toWindow = event.sender === win.webContents ? backgroundWin : win;
    toWindow.webContents.send(RTR_CHANNEL, payload);
  });
};
