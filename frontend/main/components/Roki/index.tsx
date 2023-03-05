import { useState } from "react";

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
  const [mainInputFocused, setMainInputFocused] = useState(false);

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
