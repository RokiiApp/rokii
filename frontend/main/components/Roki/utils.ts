import {
  INPUT_HEIGHT,
  MIN_VISIBLE_RESULTS,
  RESULT_HEIGHT,
} from "common/constants/ui";

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
