import { CHANNELS, StatusBarState } from 'common/constants/events';
import { on } from 'common/ipc';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import styles from './styles.module.css';

function StatusBar () {
  const [statusBarText, setStatusBarText] = useState('');
  const [icon, setIcon] = useState<StatusBarState['icon']>(null);
  const [timeoutValue, setTimeoutValue] = useState<StatusBarState['timeout']>(null);

  useEffect(() => {
    on(CHANNELS.StatusBarUpdate, (_, state) => {
      setStatusBarText(state.statusBarText);
      setIcon(state.icon);
      setTimeoutValue(state.timeout);
    });

    return () => {
      ipcRenderer.removeAllListeners(CHANNELS.StatusBarUpdate);
    };
  }, []);

  useEffect(() => {
    if (timeoutValue) {
      setTimeout(() => {
        setStatusBarText('');
        setIcon(null);
        setTimeoutValue(null);
      }, timeoutValue);
    }
  }, [timeoutValue]);

  if (!statusBarText) return null;
  return <div className={styles.statusBar}>{icon}{statusBarText}</div>;
}

export { StatusBar };
