import { autoUpdater } from 'electron-updater';
import { CHANNELS } from '../common/constants/events';
import { send } from '../common/ipc';

const TEN_SECONDS_IN_MS = 10 * 1000;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export function initAutoUpdater () {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  autoUpdater.on(CHANNELS.UpdateDownloaded, () => {
    send(CHANNELS.UpdateDownloaded);
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, TEN_SECONDS_IN_MS);

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, ONE_HOUR_IN_MS);
}
