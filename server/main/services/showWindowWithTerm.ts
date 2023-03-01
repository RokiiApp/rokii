import type { BrowserWindow } from "electron";
import { Events } from "../../common/constants/events";

export const showWindowWithTerm = (appWindow: BrowserWindow, term: string) => {
  appWindow.show();
  appWindow.focus();
  appWindow.webContents.send(Events.ShowTerm, term);
};
