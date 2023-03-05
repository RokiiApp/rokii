import type { PluginResult } from "@rokii/api";

import { useRef, useState } from "react";
import { clipboard } from "electron";
// @ts-ignore
import { focusableSelector } from "@cerebroapp/cerebro-ui";

import { Autocomplete } from "./Autocomplete";
import ResultsList from "../ResultsList";
import { StatusBar } from "../StatusBar";
import styles from "./styles.module.css";

import { getCurrentWindow } from "@electron/remote";
import { useRokiStore, useUIStateStore } from "@/state/rokiStore";
import { getAutocompleteValue } from "@/main/utils/getAutocompleteValue";
import { cursorInEndOfInput, updateElectronWindow } from "./utils";
import { useEventsSubscription } from "@/main/hooks/useEventsSubscription";
import { useGetPluginResults } from "@/main/hooks/useGetPluginResults";
import { wrapEvent } from "@/main/utils/events";

/**
 * Set focus to first focusable element in preview
 */
const focusPreview = () => {
  const previewDom = document.getElementById("preview");
  const firstFocusable = previewDom?.querySelector(focusableSelector);
  if (firstFocusable) {
    firstFocusable.focus();
  }
};

/**
 * Main search container
 */
export const Roki = () => {
  const electronWindow = getCurrentWindow();
  const maxVisibleResults = useUIStateStore((s) => s.maxVisibleResults);

  const [results, selected, term, prevTerm, statusBarText] = useRokiStore(
    (s) => [s.results, s.selected, s.term, s.prevTerm, s.statusBarText]
  );

  const updateTerm = useRokiStore((s) => s.updateTerm);
  const reset = useRokiStore((s) => s.reset);
  const moveCursor = useRokiStore((s) => s.moveCursor);

  const mainInput = useRef<HTMLInputElement>(null);
  useEventsSubscription(electronWindow, mainInput);
  useGetPluginResults(term);

  const [mainInputFocused, setMainInputFocused] = useState(false);
  const prevResultsLenght = useRef(results.length);

  if (results.length !== prevResultsLenght.current) {
    prevResultsLenght.current = results.length;
    // Resize electron window when results count changed
    updateElectronWindow(results, maxVisibleResults, term);
  }

  /**
   * Handle keyboard shortcuts
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const highlighted = highlightedResult();
    // TODO: go to first result on cmd+up and last result on cmd+down

    if (highlighted?.onKeyDown) highlighted.onKeyDown(event);

    if (event.defaultPrevented) return;

    const keyActions = {
      select: () => selectCurrent(event),

      arrowRight: () => {
        if (cursorInEndOfInput(event.target as HTMLInputElement)) {
          if (!highlighted) return;
          const autocompleteValue = getAutocompleteValue(highlighted, term);
          if (autocompleteValue) {
            // Autocomplete by arrow right only if autocomple value is shown
            autocomplete(event);
          } else {
            focusPreview();
            event.preventDefault();
          }
        }
      },

      arrowDown: () => {
        moveCursor(1);
        event.preventDefault();
      },

      arrowUp: () => {
        if (results.length > 0) {
          moveCursor(-1);
        } else if (prevTerm) {
          updateTerm(prevTerm);
        }
        event.preventDefault();
      },
    };

    // shortcuts for ctrl+...
    if ((event.metaKey || event.ctrlKey) && !event.altKey) {
      // Copy to clipboard on cmd+c
      if (event.code === "KeyC") {
        const text = highlighted?.clipboard || term;
        if (text) {
          clipboard.writeText(text);
          reset();
          if (!event.defaultPrevented) {
            electronWindow.hide();
          }
          event.preventDefault();
        }
        return;
      }

      // Select text on cmd+a
      if (event.code === "KeyA") {
        mainInput.current?.select();
        event.preventDefault();
      }

      // Select element by number
      if (isFinite(+event.key)) {
        const number = Number(event.key);
        const result = results[number];

        if (result) return selectItem(result, event);
      }

      // Lightweight vim-mode: cmd/ctrl + jklo
      switch (event.code) {
        case "KeyJ":
          keyActions.arrowDown();
          break;
        case "KeyK":
          keyActions.arrowUp();
          break;
        case "KeyL":
          keyActions.arrowRight();
          break;
        case "KeyO":
          keyActions.select();
          break;
      }
    }

    switch (event.key) {
      case "Tab":
        autocomplete(event);
        break;
      case "ArrowRight":
        keyActions.arrowRight();
        break;
      case "ArrowDown":
        keyActions.arrowDown();
        break;
      case "ArrowUp":
        keyActions.arrowUp();
        break;
      case "Enter":
        keyActions.select();
        break;
      case "Escape":
        reset();
        electronWindow.hide();
        break;
    }
  };

  const onMainInputFocus = () => setMainInputFocused(true);
  const onMainInputBlur = () => setMainInputFocused(false);

  /**
   * Get highlighted result
   */
  const highlightedResult: () => PluginResult | undefined = () => results[selected];

  type SelectItemFn = (
    item: PluginResult,
    realEvent:
      | React.KeyboardEvent<HTMLDivElement>
      | React.MouseEvent<HTMLDivElement>
  ) => void;

  /**
   * Select item from results list
   */
  const selectItem: SelectItemFn = (item, realEvent) => {
    reset();
    const event = wrapEvent(realEvent);
    item.onSelect?.(event);

    if (!event.defaultPrevented) electronWindow.hide();
  };

  /**
   * Autocomple search term from highlighted result
   */
  const autocomplete = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { term: highlightedTerm } = highlightedResult() || {};

    if (highlightedTerm && highlightedTerm !== term) {
      updateTerm(highlightedTerm);
      event.preventDefault();
    }
  };

  /**
   * Select highlighted element
   */
  const selectCurrent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const current = highlightedResult();

    if (current) {
      selectItem(current, event);
    }
  }

  return (
    <div className={styles.search}>
      <Autocomplete />
      <div className={styles.inputWrapper}>
        <input
          autoFocus
          placeholder="RoKii Search"
          type="text"
          id="main-input"
          ref={mainInput}
          value={term}
          className={styles.input}
          onChange={(e) => updateTerm(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onMainInputFocus}
          onBlur={onMainInputBlur}
        />
      </div>
      <ResultsList onSelect={selectItem} mainInputFocused={mainInputFocused} />
      {statusBarText && <StatusBar value={statusBarText} />}
    </div>
  );
};
