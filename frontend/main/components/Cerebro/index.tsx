/* eslint default-case: 0 */

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { clipboard } from "electron";
import { focusableSelector } from "@cerebroapp/cerebro-ui";
import { Autocomplete } from "./Autocomplete";

import {
  WINDOW_WIDTH,
  INPUT_HEIGHT,
  RESULT_HEIGHT,
  MIN_VISIBLE_RESULTS,
} from "common/constants/ui";
import * as searchActions from "@/main/actions/search";

import * as config from "common/config";
import ResultsList from "../ResultsList";
import StatusBar from "../StatusBar";
import styles from "./styles.module.css";

import { getCurrentWindow } from "@electron/remote";
import { useRokiStore } from "@/state/rokiStore";
import { pluginsService } from "@/plugins";
import { DEFAULT_SCOPE } from "@/main/actions/search";
import { pluginSettings } from "@/services/plugins";
import { getAutocompleteValue } from "@/main/utils/getAutocompleteValue";

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

const onDocumentKeydown = (event) => {
  if (event.keyCode === 27) {
    event.preventDefault();
    document.getElementById("main-input").focus();
  }
};

/**
 * Main search container
 *
 * TODO: Remove redux
 * TODO: Split to more components
 */
function Cerebro({
  // results,
  // selected,
  // visibleResults,
  actions,
  // term,
  // prevTerm,
  // statusBarText,
}) {
  const [
    results,
    selected,
    visibleResults,
    term,
    prevTerm,
    statusBarText,
    updateTerm,
    reset,
    hide,
    updateResult,
    addResult,
  ] = useRokiStore((s) => [
    s.results,
    s.selected,
    s.visibleResults,
    s.term,
    s.prevTerm,
    s.statusBarText,
    s.updateTerm,
    s.reset,
    s.hide,
    s.updateResult,
    s.addResult,
  ]);
  const mainInput = useRef(null);
  const [mainInputFocused, setMainInputFocused] = useState(false);
  const [prevResultsLenght, setPrevResultsLenght] = useState(
    () => results.length
  );

  const focusMainInput = () => {
    mainInput.current?.focus();
    if (config.get("selectOnShow")) {
      mainInput.current.select();
    }
  };

  // suscribe to events
  useEffect(() => {
    focusMainInput();
    updateElectronWindow(results, visibleResults);
    // Listen for window.resize and change default space for results to user's value
    window.addEventListener("resize", onWindowResize);
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
   * Handle resize window and change count of visible results depends on window size
   */
  const onWindowResize = () => {
    if (results.length <= MIN_VISIBLE_RESULTS) return;

    let maxVisibleResults = Math.floor(
      (window.outerHeight - INPUT_HEIGHT) / RESULT_HEIGHT
    );
    maxVisibleResults = Math.max(MIN_VISIBLE_RESULTS, maxVisibleResults);
    if (maxVisibleResults !== visibleResults) {
      actions.changeVisibleResults(maxVisibleResults);
    }
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
        actions.moveCursor(1);
        event.preventDefault();
      },

      arrowUp: () => {
        if (results.length > 0) {
          actions.moveCursor(-1);
        } else if (prevTerm) {
          actions.updateTerm(prevTerm);
        }
        event.preventDefault();
      },
    };

    // shortcuts for ctrl+...
    if ((event.metaKey || event.ctrlKey) && !event.altKey) {
      // Copy to clipboard on cmd+c
      if (event.keyCode === 67) {
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
      if (event.keyCode === 65) {
        mainInput.current.select();
        event.preventDefault();
      }

      // Select element by number
      if (event.keyCode >= 49 && event.keyCode <= 57) {
        const number = Math.abs(49 - event.keyCode);
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
    window.removeEventListener("resize", onWindowResize);
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
  const selectItem = (item, realEvent) => {
    reset();
    const event = wrapEvent(realEvent);
    item.onSelect(event);

    if (!event.defaultPrevented) electronWindow.hide();
  };

  /**
   * Autocomple search term from highlighted result
   */
  const autocomplete = (event) => {
    const { term: highlightedTerm } = highlightedResult();
    if (highlightedTerm && highlightedTerm !== term) {
      actions.updateTerm(highlightedTerm);
      event.preventDefault();
    }
  };

  /**
   * Select highlighted element
   */
  const selectCurrent = (event) => selectItem(highlightedResult(), event);

  return (
    <div className={styles.search}>
      <Autocomplete />
      <div className={styles.inputWrapper}>
        <input
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
        results={results}
        selected={selected}
        visibleResults={visibleResults}
        onItemHover={actions.selectElement}
        onSelect={selectItem}
        mainInputFocused={mainInputFocused}
      />
      {statusBarText && <StatusBar value={statusBarText} />}
    </div>
  );
}

Cerebro.propTypes = {
  actions: PropTypes.shape({
    reset: PropTypes.func,
    moveCursor: PropTypes.func,
    updateTerm: PropTypes.func,
    changeVisibleResults: PropTypes.func,
    selectElement: PropTypes.func,
  }),
  results: PropTypes.array,
  selected: PropTypes.number,
  visibleResults: PropTypes.number,
  term: PropTypes.string,
  statusBarText: PropTypes.string,
  prevTerm: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    selected: state.search.selected,
    results: state.search.resultIds.map((id) => state.search.resultsById[id]),
    term: state.search.term,
    statusBarText: state.statusBar.text,
    prevTerm: state.search.prevTerm,
    visibleResults: state.search.visibleResults,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(searchActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Cerebro);
