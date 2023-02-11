import type { BrowserWindow } from "electron";
import * as config from "../../common/config";

export const blurListener = (mainWindow: BrowserWindow) => {
  if (config.get("hideOnBlur")) {
    // Hide window on blur in production
    // In development we usually use developer tools that can blur a window
    mainWindow.hide();
  }
};
