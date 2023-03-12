import { Autocomplete } from "./Autocomplete";
import { SearchBar } from "./SearchBar";
import ResultsList from "../ResultsList";
import { StatusBar } from "../StatusBar";
import styles from "./styles.module.css";

import { useRokiStore } from "@/state/rokiStore";
import { useInputStore } from "@/state/inputStore";

/**
 * Main search container
 */
export const Roki = () => {
  const term = useInputStore((s) => s.term);

  const statusBarText = useRokiStore((s) => s.statusBarText);

  return (
    <div className={styles.search}>
      <div className={styles.inputWrapper}>
        <Autocomplete />
        <SearchBar />
      </div>
      <ResultsList term={term} />
      {statusBarText && <StatusBar value={statusBarText} />}
    </div>
  );
};
