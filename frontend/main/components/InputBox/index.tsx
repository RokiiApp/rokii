import styles from './styles.module.css';

import { Autocomplete } from './Autocomplete';
import { SearchBar } from './SearchBar';

export const InputBox = () => {
  return <div className={styles.inputWrapper}>
        <Autocomplete />
        <SearchBar />
    </div>;
};
