import { Router, Route } from "wouter";
import { useHashLocation } from "@/main/hooks/useHashLocation";

import ResultsList from "../ResultsList";
import { StatusBar } from "../StatusBar";
import styles from "./styles.module.css";

import { useRokiStore } from "@/state/rokiStore";
import { useInputStore } from "@/state/inputStore";
import { PluginPage } from "@/main/components/PluginPage";
import { InputBox } from "@/main/components/InputBox";

/**
 * Main search container
 */
export const Rokii = () => {
  const term = useInputStore((s) => s.term);
  const statusBarText = useRokiStore((s) => s.statusBarText);

  return (
    <div className={styles.rokiContainer}>
      <InputBox />

      <Router hook={useHashLocation}>
        <Route path="/" >
          <ResultsList term={term} />
        </Route>
        <Route path="/:plugin" component={PluginPage} />
      </Router>

      {statusBarText && <StatusBar value={statusBarText} />}
    </div>
  );
};
