import { getAutocompleteValue } from "@/main/utils/getAutocompleteValue";
import { useRokiStore } from "@/state/rokiStore";

import styles from "./styles.module.css";

export const Autocomplete = () => {
  const [results, selected, term] = useRokiStore((s) => [
    s.results,
    s.selected,
    s.term,
  ]);

  const autocompleteTerm = getAutocompleteValue(results[selected], term);

  return autocompleteTerm ? (
    <div className={styles.autocomplete}>{autocompleteTerm}</div>
  ) : null;
};
