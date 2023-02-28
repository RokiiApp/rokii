import type { PluginResult } from "@/types";

import { useEffect, useRef, memo } from "react";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import styles from "./styles.module.css";

import { RESULT_HEIGHT } from "common/constants/ui";
import Row from "./Row";
import { useRokiStore, useUIStateStore } from "@/state/rokiStore";

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
  onSelect: (
    result: any,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  mainInputFocused: boolean;
};

const ResultsList = ({ onSelect, mainInputFocused }: ResultsListProps) => {
  const maxVisibleResults = useUIStateStore((s) => s.maxVisibleResults);

  const [results, selected, setSelected] = useRokiStore((s) => [
    s.results,
    s.selected,
    s.select,
  ]);

  const listRef = useRef<VariableSizeList>(null);

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
        onSelect(result, event),
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

export default memo(ResultsList);
