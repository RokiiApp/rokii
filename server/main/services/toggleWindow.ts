import type { BrowserWindow } from "electron";

export const toggleWindow = (appWindow: BrowserWindow) => {
  if (appWindow.isVisible()) {
    appWindow.blur(); // once for blurring the content of the window(?)
    appWindow.blur(); // twice somehow restores focus to prev foreground window
    appWindow.hide();
  } else {
    appWindow.show();
    appWindow.focus();
  }
};
