import { getCurrentWindow } from "@electron/remote";
import {
  INPUT_HEIGHT,
  MIN_VISIBLE_RESULTS,
  RESULT_HEIGHT,
  WINDOW_WIDTH,
} from "common/constants/ui";
import * as config from "common/config";

export const calculateMaxVisibleResults = (resultsCount: number) => {
  if (resultsCount <= MIN_VISIBLE_RESULTS) return MIN_VISIBLE_RESULTS;

  let maxVisibleResults = Math.floor(
    (window.outerHeight - INPUT_HEIGHT) / RESULT_HEIGHT
  );
  maxVisibleResults = Math.max(MIN_VISIBLE_RESULTS, maxVisibleResults);
  return maxVisibleResults;
};

/**
 * Check if cursor in the end of input.
 * This is needed to prevent autocomplete when user is typing in the middle of input
 */
export const cursorInEndOfInput = (input: HTMLInputElement) => {
  const { selectionStart, selectionEnd, value } = input;
  return selectionStart === selectionEnd && selectionStart === value.length;
};

/**
* Update size and set resizable for main electron window
*/
export const updateElectronWindow = (
  resultsCount: number,
  maxVisibleResults: number
) => {
  const win = getCurrentWindow()
  const [x, y] = config.get('winPosition')
  const [width] = win.getSize()

  // When results list is empty window is not resizable
  win.setResizable(resultsCount !== 0)

  if (resultsCount === 0) {
    win.setMinimumSize(WINDOW_WIDTH, INPUT_HEIGHT)
    win.setSize(width, INPUT_HEIGHT)
    // Set window position to the last saved position as it is changed when window is resized

    win.setPosition(x, y)
    return
  }

  const resultHeight = Math.max(Math.min(maxVisibleResults, resultsCount), MIN_VISIBLE_RESULTS)
  const heightWithResults = resultHeight * RESULT_HEIGHT + INPUT_HEIGHT
  const minHeightWithResults = MIN_VISIBLE_RESULTS * RESULT_HEIGHT + INPUT_HEIGHT

  win.setMinimumSize(WINDOW_WIDTH, minHeightWithResults)
  win.setSize(width, heightWithResults)

  win.setPosition(x, y)
};
