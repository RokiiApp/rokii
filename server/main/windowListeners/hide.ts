import type { BrowserWindow } from "electron";
import * as config from "../../common/config";
import { Events } from "../../common/constants/events";

export const hideListener = (mainWindow: BrowserWindow) => {
  if (config.get("cleanOnHide")) {
    mainWindow.webContents.send(Events.ClearInput);
  }
};
