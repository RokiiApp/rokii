import { create } from "zustand";
import { MIN_VISIBLE_RESULTS } from "common/constants/ui";

interface RokiStore {
  // Search term in main input
  term: string;
  // Store last used term in separate field
  prevTerm: string;
  // Array of ids of results
  results: any[];
  resultIds: string[];
  resultsById: {};
  // Index of selected result
  selected: number;
  // Count of visible results
  visibleResults: number;
  statusBarText: string;
  setStatusBarText: (text: string) => void;
  reset: () => void;
  addResult: (result: any) => void;
  updateTerm: (term: string) => void;
  hide: (id: string) => void;
  updateResult: (id: string, result: any) => void;
}
const defaultState = {
  results: [],
  term: "",
  prevTerm: "",
  resultIds: [],
  resultsById: {},
  selected: 0,
  visibleResults: MIN_VISIBLE_RESULTS,
  statusBarText: "",
};

export const useRokiStore = create<RokiStore>((set) => ({
  ...structuredClone(defaultState),
  reset: () => set(structuredClone(defaultState)),
  addResult: (result) =>
    set((state) => {
      if (Array.isArray(result)) {
        const newResults = [...state.results, ...result];
        const newResultsIds = [...state.resultIds, ...result.map((i) => i.id)];
        return {
          ...state,
          results: newResults,
          resultIds: newResultsIds,
          resultsById: {
            ...state.resultsById,
            ...result.reduce((acc, i) => {
              acc[i.id] = i;
              return acc;
            }, {}),
          },
        };
      }

      return {
        ...state,
        results: [...state.results, result],
        resultIds: [...state.resultIds, result.id],
        resultsById: {
          ...state.resultsById,
          [result.id]: result,
        },
      };
    }),

  updateTerm: (term) => {
    if (term === "") return set(structuredClone(defaultState));
    set((state) => ({
      ...structuredClone(defaultState),
      term,
      prevTerm: state.term,
      selected: 0,
    }));
  },

  setStatusBarText: (text) => set({ statusBarText: text }),
  hide: (id) =>
    set((state) => {
      const newResults = state.results.filter((i) => i.id !== id);
      const newResultsIds = state.resultIds.filter((i) => i !== id);
      return { ...state, results: newResults, resultIds: newResultsIds };
    }),

  updateResult: (id, result) =>
    set((state) => {
      const newResults = state.results.map((i) => {
        if (i.id === id) {
          return result;
        }
        return i;
      });

      return {
        ...state,
        resultsById: {
          ...state.resultsById,
          [id]: result,
        },
        results: newResults,
      };
    }),
}));
