import {
  RESULT_HEIGHT,
  INPUT_HEIGHT,
  MIN_VISIBLE_RESULTS,
} from "common/constants/ui";

// export const windowResizeHandler = (results: any[], ) => {
//     if (results.length <= MIN_VISIBLE_RESULTS) return;

//     let maxVisibleResults = Math.floor(
//       (window.outerHeight - INPUT_HEIGHT) / RESULT_HEIGHT
//     );
//     maxVisibleResults = Math.max(MIN_VISIBLE_RESULTS, maxVisibleResults);
//     if (maxVisibleResults !== visibleResults) {
//       actions.changeVisibleResults(maxVisibleResults);
//     }
//   };
