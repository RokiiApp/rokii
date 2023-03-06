import type { PluginResult } from "@rokii/api";

import { useEffect, useRef, memo } from "react";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import styles from "./styles.module.css";

import { RESULT_HEIGHT } from "common/constants/ui";
import Row from "./Row";
import { useRokiStore, useUIStateStore } from "@/state/rokiStore";
import { useGetPluginResults } from "@/main/hooks/useGetPluginResults";
import { wrapEvent } from "@/main/utils/events";
import { getCurrentWindow } from "@electron/remote";
import { updateElectronWindow } from "../Roki/utils";
import { PluginPreview } from "./PluginPreview";

const ResultsList = ({ term }: { term: string }) => {
  const electronWindow = useRef(getCurrentWindow());
  const prevResultsCount = useRef(0);
  useGetPluginResults(term);
  const maxVisibleResults = useUIStateStore((s) => s.maxVisibleResults);

  const [results, selected, reset] = useRokiStore((s) => [
    s.results,
    s.selected,
    s.reset
  ]);
  const listRef = useRef<VariableSizeList>(null);

  /**
   * Select item from results list
   */
  const selectItem: SelectItemFn = (item, realEvent) => {
    reset();
    const event = wrapEvent(realEvent);
    item.onSelect?.(event);
    if (!event.defaultPrevented) electronWindow.current.hide();
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(selected, "smart");
    }
  }, [selected]);

  const rowRenderer = ({ index, style }: ListChildComponentProps) => {
    const result = results[index];
    const isSelected = index === selected;
    const attrs = {
      index,
      ...result,
      // TODO: think about events
      // In some cases action should be executed and window should be closed
      // In some cases we should autocomplete value
      isSelected,
      onSelect: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        selectItem(result, event),

    } as const;
    return <Row style={style} {...attrs} />;
  };

  if (prevResultsCount.current !== results.length) {
    prevResultsCount.current = results.length;
    updateElectronWindow(results.length, maxVisibleResults);
  }

  if (results.length === 0) return null;

  const selectedResult = results[selected];
  return (
    <div className={styles.wrapper}>
      <VariableSizeList
        ref={listRef}
        className={styles.resultsList}
        height={maxVisibleResults * RESULT_HEIGHT}
        itemSize={() => RESULT_HEIGHT}
        itemCount={results.length}
        overscanCount={5}
        width={
          results[selected] !== undefined && results[selected].getPreview
            ? 250
            : 10000
        }
      >
        {(a) => rowRenderer(a)}
      </VariableSizeList>

      {typeof selectedResult.getPreview === "function" && (
        // @ts-ignore
        <PluginPreview plugin={selectedResult} />
      )}
    </div>
  );
};

type SelectItemFn = (
  item: PluginResult,
  realEvent:
    | React.KeyboardEvent<HTMLDivElement>
    | React.MouseEvent<HTMLDivElement>
) => void;

export default memo(ResultsList);
