import { app } from "electron";
import AutoLaunch from "auto-launch";

const isLinux = !["win32", "darwin"].includes(process.platform);
const isDevelopment = process.env.NODE_ENV === "development";

const appLauncher = isLinux ? new AutoLaunch({ name: "RoKii" }) : null;

const isAutoStartEnabled = async () =>
  isLinux ? appLauncher.isEnabled() : app.getLoginItemSettings().openAtLogin;

const setAutoStart = async (openAtLogin: boolean) => {
  const openAtStartUp = openAtLogin && !isDevelopment;
  if (isLinux) {
    return openAtStartUp ? appLauncher.enable() : appLauncher.disable();
  }

  return app.setLoginItemSettings({ openAtLogin: openAtStartUp });
};

export { isAutoStartEnabled, setAutoStart };
