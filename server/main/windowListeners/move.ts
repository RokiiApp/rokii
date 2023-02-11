import type { BrowserWindow } from "electron";
import debounce from "just-debounce";
import * as config from "../../common/config";

const debouncedMove = debounce((mainWindow: BrowserWindow) => {
  if (!mainWindow.isVisible()) return;

  config.set("winPosition", mainWindow.getPosition() as [number, number]);
}, 100);

export const moveListener = (mainWindow: BrowserWindow) => {
  debouncedMove(mainWindow);
};
