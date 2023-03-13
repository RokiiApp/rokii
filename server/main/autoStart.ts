import { app } from 'electron';

const isDevelopment = process.env.NODE_ENV === 'development';

const isAutoStartEnabled = async () => app.getLoginItemSettings().openAtLogin;

const setAutoStart = async (openAtLogin: boolean) => {
  const openAtStartUp = openAtLogin && !isDevelopment;

  return app.setLoginItemSettings({ openAtLogin: openAtStartUp });
};

export { isAutoStartEnabled, setAutoStart };
