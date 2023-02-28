import type { PluginResult } from "@/types";

import { useRef, useState } from "react";
import { clipboard } from "electron";
// @ts-ignore
import { focusableSelector } from "@cerebroapp/cerebro-ui";
import { Autocomplete } from "./Autocomplete";

import {
  WINDOW_WIDTH,
  INPUT_HEIGHT,
  RESULT_HEIGHT,
  MIN_VISIBLE_RESULTS,
} from "common/constants/ui";

import ResultsList from "../ResultsList";
import { StatusBar } from "../StatusBar";
import styles from "./styles.module.css";

import { getCurrentWindow } from "@electron/remote";
import { useRokiStore } from "@/state/rokiStore";
import { getAutocompleteValue } from "@/main/utils/getAutocompleteValue";
import { cursorInEndOfInput } from "./utils";
import { useEventsSubscription } from "@/main/hooks/useEventsSubscription";
import { useGetPluginResults } from "@/main/hooks/useGetPluginResults";

/**
 * Wrap click or mousedown event to custom `select-item` event,
 * that includes only information about clicked keys (alt, shift, ctrl and meta)
 *
 * @param  {Event} realEvent
 * @return {CustomEvent}
 */
const wrapEvent = (realEvent: any) => {
  const event = new CustomEvent("select-item", { cancelable: true });
  event.altKey = realEvent.altKey;
  event.shiftKey = realEvent.shiftKey;
  event.ctrlKey = realEvent.ctrlKey;
  event.metaKey = realEvent.metaKey;
  return event;
};

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
 * Set resizable and size for main electron window when results count is changed
 */
const updateElectronWindow = (
  results: any[],
  visibleResults: number,
  term: string
) => {
  const { length } = results;
  const win = getCurrentWindow();
  const [width] = win.getSize();

  // When results list is empty window is not resizable
  win.setResizable(length !== 0);

  if (length === 0 && term === "") {
    win.setMinimumSize(WINDOW_WIDTH, INPUT_HEIGHT);
    win.setSize(width, INPUT_HEIGHT);
    return;
  }

  const resultHeight = Math.max(
    Math.min(visibleResults, length),
    MIN_VISIBLE_RESULTS
  );
  const heightWithResults = resultHeight * RESULT_HEIGHT + INPUT_HEIGHT;
  const minHeightWithResults =
    MIN_VISIBLE_RESULTS * RESULT_HEIGHT + INPUT_HEIGHT;
  win.setMinimumSize(WINDOW_WIDTH, minHeightWithResults);
  win.setSize(width, heightWithResults);
};

/**
 * Main search container
 */
export const Roki = () => {
  const electronWindow = getCurrentWindow();
  const [results, selected, visibleResults, term, prevTerm, statusBarText] =
    useRokiStore((s) => [
      s.results,
      s.selected,
      s.visibleResults,
      s.term,
      s.prevTerm,
      s.statusBarText,
    ]);

  const [updateTerm, reset, moveCursor] = useRokiStore((s) => [
    s.updateTerm,
    s.reset,
    s.moveCursor,
  ]);

  const mainInput = useRef<HTMLInputElement>(null);
  useEventsSubscription(electronWindow, mainInput);
  useGetPluginResults(term);

  const [mainInputFocused, setMainInputFocused] = useState(false);
  const prevResultsLenght = useRef(results.length);

  if (results.length !== prevResultsLenght.current) {
    prevResultsLenght.current = results.length;
    // Resize electron window when results count changed
    updateElectronWindow(results, visibleResults, term);
  }

  /**
   * Handle keyboard shortcuts
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const highlighted = highlightedResult();
    // TODO: go to first result on cmd+up and last result on cmd+down
    if (highlighted && highlighted.onKeyDown) highlighted.onKeyDown(event);

    if (event.defaultPrevented) {
      return;
    }

    const keyActions = {
      select: () => selectCurrent(event),

      arrowRight: () => {
        if (cursorInEndOfInput(event.target as HTMLInputElement)) {
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
  const highlightedResult = () => results[selected];

  /**
   * Select item from results list
   */
  const selectItem = (item: PluginResult, realEvent: any) => {
    reset();
    const event = wrapEvent(realEvent);
    item.onSelect?.(event);

    if (!event.defaultPrevented) electronWindow.hide();
  };

  /**
   * Autocomple search term from highlighted result
   */
  const autocomplete = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { term: highlightedTerm } = highlightedResult();

    if (highlightedTerm && highlightedTerm !== term) {
      updateTerm(highlightedTerm);
      event.preventDefault();
    }
  };

  /**
   * Select highlighted element
   */
  const selectCurrent = (event: React.KeyboardEvent<HTMLInputElement>) =>
    selectItem(highlightedResult(), event);

  return (
    <div className={styles.search}>
      <Autocomplete />
      <div className={styles.inputWrapper}>
        <input
          autoFocus
          placeholder="RoKI Search"
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
