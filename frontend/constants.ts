import { MIN_VISIBLE_RESULTS } from "common/constants/ui";

/**
 * Base url of npm API
 */
export const NPM_API_BASE = "https://registry.npmjs.org/";

export const INITIAL_STATE = {
    results: [],
    term: "",
    prevTerm: "",
    selected: 0,
    visibleResults: MIN_VISIBLE_RESULTS,
    statusBarText: "",
  };
