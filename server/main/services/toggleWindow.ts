import type { BrowserWindow } from "electron";
import * as config from "../../common/config";
import { CHANNELS } from "../../common/constants/events";
import { send } from "../../common/ipc";

export const toggleWindow = (appWindow: BrowserWindow) => {
  if (appWindow.isVisible()) {
    if (config.get("cleanOnHide")) {
      send(CHANNELS.ClearInput);
    }

    appWindow.blur();
    appWindow.hide();
  } else {
    appWindow.show();
  }
};
