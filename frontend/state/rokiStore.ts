import { INITIAL_STATE } from "@/constants";
import type { PluginResult } from "@/types";

import { create } from "zustand";
import { isResultValid } from "./utils";

interface RokiStore {
  // Search term in main input
  term: string;
  // Store last used term in separate field
  prevTerm: string;
  // Array of ids of results
  results: PluginResult[];
  // Index of selected result
  selected: number;
  // Count of visible results
  visibleResults: number;
  statusBarText: string;
  setStatusBarText: (text: string) => void;
  reset: () => void;
  addResult: (pluginName: string, result: PluginResult | PluginResult[]) => void;
  updateTerm: (term: string) => void;
  hide: (id: string) => void;
  updateResult: (id: string, newResult: PluginResult) => void;
  moveCursor: (direction: number) => void;
  setVisibleResults: (count: number) => void;
  select: (index: number) => void;
}



export const useRokiStore = create<RokiStore>((set) => ({
  ...INITIAL_STATE,

  reset: () => set(INITIAL_STATE),

  addResult: (pluginName, result) => {
    if (!isResultValid(result)) return;
  
    return set((state) => {
      if (!Array.isArray(result)) result = [result];

      const normalizedNewResults = result.map((result) => ({
        ...result,
        id: `${pluginName}-${result.id || result.title}`,
        term: result.term || result.title,
      }));

      const deleteDuplicatesFilter = (element: PluginResult) => {
        return !state.results.some((result) => result.id === element.id);
      }

      const newResultsWithoutDuplicates = normalizedNewResults.filter(deleteDuplicatesFilter);

      return {
        results: [...state.results, ...newResultsWithoutDuplicates],
      };
    });
  },

  updateTerm: (term) => {
    set((state) => {
      if (term === "") {
        return { term, prevTerm: state.term, selected: 0, results: [] };
      }
      return { term, prevTerm: state.term, selected: 0, results: [] };
    });
  },

  setStatusBarText: (text) => set({ statusBarText: text }),
  hide: (id) =>
    set((state) => {
      const newResults = state.results.filter((i) => i.id !== id);
      return { results: newResults };
    }),

  updateResult: (id, result) =>
    set((state) => {
      const newResults = state.results.filter((i) => i.id !== id);
      return {
        results: newResults.concat(result),
      };
    }),

  moveCursor: (direction) =>
    set((state) => {
      const newSelected = state.selected + direction;
      if (newSelected < 0 || newSelected >= state.results.length) {
        return state;
      }
      return { selected: newSelected };
    }),
  setVisibleResults: (count) => set({ visibleResults: count }),
  select: (index: number) => set({ selected: index }),
}));
