import type { BrowserWindow } from "electron";
import * as config from "../../common/config";

export const hideListener = (mainWindow: BrowserWindow) => {
  if (config.get("cleanOnHide")) {
    mainWindow.webContents.send("clearInput");
  }
};
