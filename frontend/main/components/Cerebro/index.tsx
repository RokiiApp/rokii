/* eslint default-case: 0 */

import { useEffect, useRef, useState } from "react";
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

import * as config from "common/config";
import ResultsList from "../ResultsList";
import { StatusBar } from "../StatusBar";
import styles from "./styles.module.css";

import { getCurrentWindow } from "@electron/remote";
import { useRokiStore } from "@/state/rokiStore";
import { pluginsService } from "@/plugins";
import { DEFAULT_SCOPE } from "@/main/utils/pluginDefaultScope";
import { pluginSettings } from "@/services/plugins";
import { getAutocompleteValue } from "@/main/utils/getAutocompleteValue";
import { calculateMaxVisibleResults } from "./utils";

/**
 * Wrap click or mousedown event to custom `select-item` event,
 * that includes only information about clicked keys (alt, shift, ctrl and meta)
 *
 * @param  {Event} realEvent
 * @return {CustomEvent}
 */
const wrapEvent = (realEvent) => {
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
 * Check if cursor in the end of input
 *
 * @param  {DOMElement} input
 */
const cursorInEndOfInut = ({ selectionStart, selectionEnd, value }) =>
  selectionStart === selectionEnd && selectionStart >= value.length;

const electronWindow = getCurrentWindow();

/**
 * Set resizable and size for main electron window when results count is changed
 */
const updateElectronWindow = (results: any[], visibleResults: number) => {
  const { length } = results;
  const win = getCurrentWindow();
  const [width] = win.getSize();

  // When results list is empty window is not resizable
  win.setResizable(length !== 0);

  if (length === 0) {
    win.setMinimumSize(WINDOW_WIDTH, INPUT_HEIGHT);
    win.setSize(width, INPUT_HEIGHT);
    const [x, y] = config.get("winPosition");
    win.setPosition(x, y);
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
  const [x, y] = config.get("winPosition");
  win.setPosition(x, y);
};

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === "escape") {
    event.preventDefault();
    (document.getElementById("main-input") as HTMLInputElement).focus();
  }
};

/**
 * Main search container
 *
 * TODO: Split to more components
 */
function Cerebro() {
  const [results, selected, visibleResults, term, prevTerm, statusBarText] =
    useRokiStore((s) => [
      s.results,
      s.selected,
      s.visibleResults,
      s.term,
      s.prevTerm,
      s.statusBarText,
    ]);
  const [
    updateTerm,
    reset,
    hide,
    updateResult,
    addResult,
    moveCursor,
    setVisibleResults,
    setSelected,
  ] = useRokiStore((s) => [
    s.updateTerm,
    s.reset,
    s.hide,
    s.updateResult,
    s.addResult,
    s.moveCursor,
    s.setVisibleResults,
    s.select,
  ]);
  const mainInput = useRef<any>();
  const [mainInputFocused, setMainInputFocused] = useState(false);
  const [prevResultsLenght, setPrevResultsLenght] = useState(
    () => results.length
  );

  const focusMainInput = () => {
    mainInput.current?.focus();
    if (config.get("selectOnShow")) {
      mainInput.current?.select();
    }
  };

  // suscribe to events
  useEffect(() => {
    updateElectronWindow(results, visibleResults);
    // Listen for window.resize and change default space for results to user's value
    window.addEventListener("resize", handleResize);
    // Add some global key handlers
    window.addEventListener("keydown", onDocumentKeydown);
    // Cleanup event listeners on unload
    // NOTE: when page refreshed (location.reload) componentWillUnmount is not called
    window.addEventListener("beforeunload", cleanup);
    electronWindow.on("show", focusMainInput);
    electronWindow.on("show", () =>
      updateElectronWindow(results, visibleResults)
    );

    // function to be called when unmounted
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const { allPlugins } = pluginsService;
    // TODO: order results by frequency?
    Object.keys(allPlugins).forEach((name) => {
      const plugin = allPlugins[name];
      try {
        plugin.fn?.({
          ...DEFAULT_SCOPE,
          replaceTerm: (newTerm: string) => updateTerm(newTerm),
          term,
          hide: (id: string) => hide(`${name}-${id}`),
          update: (id: string, result: any) =>
            updateResult(`${name}-${id}`, result),
          display: (payload: any) => addResult(payload),
          settings: pluginSettings.getUserSettings(plugin, name),
        });
      } catch (error) {
        // Do not fail on plugin errors, just log them to console
        console.log("Error running plugin", name, error);
      }
    });
  }, [term]);

  if (results.length !== prevResultsLenght) {
    // Resize electron window when results count changed
    updateElectronWindow(results, visibleResults);
    setPrevResultsLenght(results.length);
  }

  /**
   * Change count of visible results depends on window size
   */
  const handleResize = (setVisibleResults: any) => {
    const newMaxVisibleResults = calculateMaxVisibleResults(results);
    setVisibleResults(newMaxVisibleResults);
  };

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
        if (cursorInEndOfInut(event.target)) {
          if (getAutocompleteValue(results[selected], term)) {
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
      if (event.key === "c") {
        const text = highlightedResult()?.clipboard || term;
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
      if (event.key === "a") {
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
      switch (event.keyCode) {
        case 74:
          keyActions.arrowDown();
          break;
        case 75:
          keyActions.arrowUp();
          break;
        case 76:
          keyActions.arrowRight();
          break;
        case 79:
          keyActions.select();
          break;
      }
    }

    switch (event.keyCode) {
      case 9:
        autocomplete(event);
        break;
      case 39:
        keyActions.arrowRight();
        break;
      case 40:
        keyActions.arrowDown();
        break;
      case 38:
        keyActions.arrowUp();
        break;
      case 13:
        keyActions.select();
        break;
      case 27:
        reset();
        electronWindow.hide();
        break;
    }
  };

  const onMainInputFocus = () => setMainInputFocused(true);
  const onMainInputBlur = () => setMainInputFocused(false);

  const cleanup = () => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("keydown", onDocumentKeydown);
    window.removeEventListener("beforeunload", cleanup);
    electronWindow.removeAllListeners("show");
  };

  /**
   * Get highlighted result
   */
  const highlightedResult = () => results[selected];

  /**
   * Select item from results list
   * @param  {[type]} item [description]
   * @return {[type]}      [description]
   */
  const selectItem = (item: any, realEvent: any) => {
    reset();
    const event = wrapEvent(realEvent);
    item.onSelect(event);

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
      <ResultsList
        onItemHover={setSelected}
        onSelect={selectItem}
        mainInputFocused={mainInputFocused}
      />
      {statusBarText && <StatusBar value={statusBarText} />}
    </div>
  );
}

export default Cerebro;
