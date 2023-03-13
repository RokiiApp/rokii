import { BrowserWindow } from 'electron';
import { CHANNELS } from '../../common/constants/events';
import { on } from '../../common/ipc';

/**
 * As electron does not support communication between renderer processes,
 * we need to use this workaround. This function sets up the communication
 * between the main window and the background window.
 */
export const setupRTRCommunication = (
  win: BrowserWindow,
  backgroundWin: BrowserWindow
) => {
  on(CHANNELS.RendererToRenderer, (event, payload) => {
    // in this case we dont use ipc because we want to send the message
    // to a concrete window, not to all windows
    const toWindow = event.sender === win.webContents ? backgroundWin : win;
    toWindow.webContents.send(CHANNELS.RendererToRenderer, payload);
  });
};
