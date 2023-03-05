import { dialog, app, shell } from "electron";
import { autoUpdater, UpdateFileInfo } from "electron-updater";

const currentVersion = app.getVersion();
const DEFAULT_DOWNLOAD_URL = "https://github.com/dubisdev/rokii/releases";

const TITLE = "RoKii Updates";

const PLATFORM_EXTENSIONS = {
  darwin: "dmg",
  linux: "AppImage",
  win32: "exe",
};

const { platform } = process;
const installerExtension = PLATFORM_EXTENSIONS[platform];

const findInstaller = (assets: UpdateFileInfo[]) => {
  if (!installerExtension) return DEFAULT_DOWNLOAD_URL;

  const regexp = new RegExp(`\.${installerExtension}$`);
  const downloadUrl = assets.find(({ url }) => url.match(regexp)).url;

  return downloadUrl || DEFAULT_DOWNLOAD_URL;
};

export const checkForUpdates = async () => {
  try {
    const release = await autoUpdater.checkForUpdates();
    if (release) {
      const {
        updateInfo: { version, files },
      } = release;
      const { response } = await dialog.showMessageBox({
        buttons: ["Skip", "Download"],
        defaultId: 1,
        cancelId: 0,
        title: TITLE,
        message: `New version available: ${version}`,
        detail: "Click download to get it now",
      });

      if (response === 1) {
        const url = findInstaller(files);
        shell.openExternal(url);
      }
    } else {
      dialog.showMessageBox({
        title: TITLE,
        message: `You are using latest version of RoKii (${currentVersion})`,
        buttons: [],
      });
    }
  } catch (err) {
    console.log("Catch error!", err);
    dialog.showErrorBox(TITLE, "Error fetching latest version");
  }
};
