import { useRef, useState } from "react";

import { Autocomplete } from "./Autocomplete";
import { SearchBar } from "./SearchBar";
import ResultsList from "../ResultsList";
import { StatusBar } from "../StatusBar";
import styles from "./styles.module.css";

import { useRokiStore, useUIStateStore } from "@/state/rokiStore";
import { updateElectronWindow } from "./utils";

/**
 * Main search container
 */
export const Roki = () => {
  const maxVisibleResults = useUIStateStore((s) => s.maxVisibleResults);

  const [results, term, statusBarText] = useRokiStore(
    (s) => [s.results, s.term, s.statusBarText]
  );

  const [mainInputFocused, setMainInputFocused] = useState(false);
  const prevResultsLenght = useRef(results.length);

  if (results.length !== prevResultsLenght.current) {
    prevResultsLenght.current = results.length;
    // Resize electron window when results count changed
    updateElectronWindow(results.length, maxVisibleResults, term);
  }

  return (
    <div className={styles.search}>
      <Autocomplete />
      <div className={styles.inputWrapper}>
        <SearchBar setMainInputFocused={setMainInputFocused} />
      </div>
      <ResultsList term={term} mainInputFocused={mainInputFocused} />
      {statusBarText && <StatusBar value={statusBarText} />}
    </div>
  );
};
