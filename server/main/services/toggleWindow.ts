import type { BrowserWindow } from "electron";
import * as config from "../../common/config";
import { Events } from "../../common/constants/events";

export const toggleWindow = (appWindow: BrowserWindow) => {
  if (appWindow.isVisible()) {
    if (config.get("cleanOnHide")) {
      appWindow.webContents.send(Events.ClearInput);
    }

    appWindow.blur();
    appWindow.hide();
  } else {
    appWindow.show();
  }
};
