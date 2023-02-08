import type { BrowserWindow } from "electron";

export const showWindowWithTerm = (appWindow: BrowserWindow, term: string) => {
  appWindow.show();
  appWindow.focus();
  appWindow.webContents.send("message", {
    message: "showTerm",
    payload: term,
  });
};