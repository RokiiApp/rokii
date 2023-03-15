import styles from './styles.module.css';

import { useEffect } from 'react';
import { getCurrentWindow } from '@electron/remote';
import { Autocomplete } from './Autocomplete';
import { SearchBar } from './SearchBar';
import { useHashLocation } from '@/main/hooks/useHashLocation';
import { CHANNELS } from 'common/constants/events';
import { useInputStore } from '@/state/inputStore';

export const InputBox = () => {
  const [location, setLocation] = useHashLocation();
  const updateTerm = useInputStore(s => s.updateTerm);

  useEffect(() => {
    getCurrentWindow().webContents.send(CHANNELS.FocusInput);
    updateTerm('');
  }, [location]);

  const isRoot = location === '/';

  return (
    <div className={styles.inputWrapper}>
      {!isRoot && <button className={styles.backButton} onClick={() => setLocation('/')}>{'<'}</button>}

      <div className={styles.inputArea}>
        <Autocomplete />
        <SearchBar />
      </div>

    </div>
  );
};
