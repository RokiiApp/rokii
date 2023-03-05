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

const PluginPreview = ({
  plugin,
}: {
  plugin: PluginResult & { getPreview: () => JSX.Element };
}) => {
  const preview = plugin.getPreview();
  const previewIsString = typeof preview === "string";

  return (
    <div className={styles.preview} id="preview">
      {previewIsString ? (
        <div dangerouslySetInnerHTML={{ __html: preview }} />
      ) : (
        preview
      )}
    </div>
  );
};

type ResultsListProps = {
  mainInputFocused: boolean;
  term: string;
};

const ResultsList = ({ mainInputFocused, term }: ResultsListProps) => {
  const electronWindow = useRef(getCurrentWindow());
  useGetPluginResults(term);
  const maxVisibleResults = useUIStateStore((s) => s.maxVisibleResults);

  const [results, selected, setSelected, reset] = useRokiStore((s) => [
    s.results,
    s.selected,
    s.setSelected,
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
      ...result,
      // TODO: think about events
      // In some cases action should be executed and window should be closed
      // In some cases we should autocomplete value
      isSelected,
      onSelect: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        selectItem(result, event),
      // Move selection to item under cursor
      onMouseMove: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const { movementX, movementY } = event.nativeEvent;
        if (isSelected || !mainInputFocused) return false;

        if (movementX || movementY) {
          // Hover item only when we had real movement of mouse
          // We should prevent changing of selection when user uses keyboard
          setSelected(index);
        }
      },
    } as const;
    return <Row style={style} {...attrs} />;
  };

  const classNames = [
    styles.resultsList,
    mainInputFocused ? styles.focused : styles.unfocused,
  ].join(" ");

  updateElectronWindow(results.length, maxVisibleResults, term);
  if (results.length === 0) return null;

  const selectedResult = results[selected];
  return (
    <div className={styles.wrapper}>
      <VariableSizeList
        ref={listRef}
        className={classNames}
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
