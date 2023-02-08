import * as config from "common/config";
import { shell, clipboard } from "electron";

import { getCurrentWindow } from "@electron/remote";

/**
 * Default scope object would be first argument for plugins
 *
 */
export const DEFAULT_SCOPE = {
  config,
  actions: {
    open: (url: string) => shell.openExternal(url),
    reveal: (path: string) => shell.showItemInFolder(path),
    copyToClipboard: (text: string) => clipboard.writeText(text),
    hideWindow: () => getCurrentWindow().hide(),
  },
};
