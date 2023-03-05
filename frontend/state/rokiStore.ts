import type { PluginResult } from "@rokii/api";

import { INITIAL_STATE } from "@/constants";
import { MIN_VISIBLE_RESULTS } from "common/constants/ui";

import { create } from "zustand";
import { isResultValid } from "./utils";

interface UIStateStore {
  maxVisibleResults: number;
  setMaxVisibleResults: (count: number) => void;
}

export const useUIStateStore = create<UIStateStore>((set) => ({
  maxVisibleResults: MIN_VISIBLE_RESULTS,
  setMaxVisibleResults: (count) => set({ maxVisibleResults: count }),
}));

interface RokiStore {
  results: PluginResult[];
  /**
   * Index of selected result
   */
  selected: number;
  statusBarText: string;
  setStatusBarText: (text: string) => void;
  /**
   * Reset state to initial state
   */
  reset: () => void;
  addResult: (pluginName: string, result: PluginResult | PluginResult[]) => void;
  hide: (id: string) => void;
  updateResult: (id: string, newResult: PluginResult) => void;
  moveCursor: (direction: number) => void;
  setSelected: (index: number) => void;
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
        term: result.term || "",
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

  setSelected: (index: number) => set({ selected: index }),
}));
