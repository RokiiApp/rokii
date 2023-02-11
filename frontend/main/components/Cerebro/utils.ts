import {
  INPUT_HEIGHT,
  MIN_VISIBLE_RESULTS,
  RESULT_HEIGHT,
} from "common/constants/ui";
import debounce from "just-debounce";

const calculateMaxVisibleResultsWithoutDebounce = (results: any[]) => {
  if (results.length <= MIN_VISIBLE_RESULTS) return MIN_VISIBLE_RESULTS;

  let maxVisibleResults = Math.floor(
    (window.outerHeight - INPUT_HEIGHT) / RESULT_HEIGHT
  );
  maxVisibleResults = Math.max(MIN_VISIBLE_RESULTS, maxVisibleResults);
  return maxVisibleResults;
};

export const calculateMaxVisibleResults = debounce(
  calculateMaxVisibleResultsWithoutDebounce,
  100
);
