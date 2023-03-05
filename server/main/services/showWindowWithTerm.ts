import type { BrowserWindow } from "electron";
import { CHANNELS } from "../../common/constants/events";
import { send } from "../../common/ipc";

export const showWindowWithTerm = (appWindow: BrowserWindow, term: string) => {
  appWindow.show();
  appWindow.focus();
  send(CHANNELS.ShowTerm, term);
};
