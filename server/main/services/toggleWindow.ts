import type { BrowserWindow } from "electron";
import * as config from "../../common/config";

export const toggleWindow = (appWindow: BrowserWindow) => {
  if (appWindow.isVisible()) {
    if (config.get("cleanOnHide")) {
      appWindow.webContents.send("clearInput");
    }

    appWindow.blur();
    appWindow.hide();
  } else {
    appWindow.show();
  }
};
