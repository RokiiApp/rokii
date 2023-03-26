import type { PluginResult } from '@rokii/types';

import { useEffect, useRef, memo } from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import styles from './styles.module.css';

import { RESULT_HEIGHT, VISIBLE_RESULTS } from 'common/constants/ui';
import Row from './Row';
import { useRokiStore } from '@/state/rokiStore';
import { useGetPluginResults } from '@/main/hooks/useGetPluginResults';
import { wrapEvent } from '@/main/utils/events';
import { PluginPreview, PluginResultWithPreview } from '@/main/components/PluginPreview';
import { useInputStore } from '@/state/inputStore';

type SelectItemFn = (
  item: PluginResult,
  realEvent:
    | React.KeyboardEvent<HTMLDivElement>
    | React.MouseEvent<HTMLDivElement>
) => void;

const ResultsList = () => {
  const [term, updateTerm] = useInputStore((s) => [s.term, s.updateTerm]);
  useGetPluginResults(term);

  const [results, selected] = useRokiStore((s) => [
    s.results,
    s.selected
  ]);
  const listRef = useRef<VariableSizeList>(null);

  /**
   * Select item from results list
   */
  const selectItem: SelectItemFn = (item, realEvent) => {
    const event = wrapEvent(realEvent);
    item.onSelect?.(event);
    updateTerm('');
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(selected, 'smart');
    }
  }, [selected]);

  const rowRenderer = ({ index, style }: ListChildComponentProps) => {
    const result = results[index];
    const isSelected = index === selected;
    const attrs = {
      index,
      ...result,
      isSelected,
      onSelect: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        selectItem(result, event)

    } as const;
    return <Row style={style} {...attrs} />;
  };

  if (results.length === 0) return null;

  const selectedResult = results[selected];
  return (
    <div className={styles.wrapper}>
      <VariableSizeList
        ref={listRef}
        className={styles.resultsList}
        height={VISIBLE_RESULTS * RESULT_HEIGHT}
        itemSize={() => RESULT_HEIGHT}
        itemCount={results.length}
        overscanCount={5}
        width={
          results[selected] !== undefined && results[selected].getPreview
            ? '30%'
            : '100%'
        }
      >
        {(a) => rowRenderer(a)}
      </VariableSizeList>

      {typeof selectedResult.getPreview === 'function' && (
        <PluginPreview plugin={selectedResult as PluginResultWithPreview} />
      )}
    </div>
  );
};

export default memo(ResultsList);
