import type { BrowserWindow } from "electron";
import debounce from "just-debounce";
import * as config from "../../common/config";

const onMove = (mainWindow: BrowserWindow) => {
  if (!mainWindow.isVisible()) return;

  config.set("winPosition", mainWindow.getPosition() as [number, number]);
};

export const moveListener = debounce(onMove, 100);
