import type { PluginResult } from '@rokii/types';
import styles from './styles.module.css';
import { useRef } from 'react';
import { clipboard } from 'electron';
import { getCurrentWindow } from '@electron/remote';

import { getAutocompleteValue } from '@/main/utils/getAutocompleteValue';
import { useRokiStore } from '@/state/rokiStore';
import { cursorInEndOfInput } from '@/main/utils/cursorInEndOfInput';
import { wrapEvent } from '@/main/utils/events';
import { useSearchBarEventsSubscription } from '@/main/hooks/useSearchBarEventsSubscription';
import { useInputStore } from '@/state/inputStore';
import { CHANNELS } from 'common/constants/events';
import { useHashLocation } from '@/main/hooks/useHashLocation';

type SelectItemFn = (
  item: PluginResult,
  realEvent:
    | React.KeyboardEvent<HTMLDivElement>
    | React.MouseEvent<HTMLDivElement>
) => void;

export const SearchBar = () => {
  const [location, navigate] = useHashLocation();
  const { current: electronWindow } = useRef(getCurrentWindow());

  const moveCursor = useRokiStore((s) => s.moveCursor);
  const setSelected = useRokiStore((s) => s.setSelected);

  const [term, prevTerm, updateTerm] = useInputStore(s => [s.term, s.prevTerm, s.updateTerm]);

  const [results, selected] = useRokiStore((s) => [s.results, s.selected]);

  const mainInput = useRef<HTMLInputElement>(null);
  useSearchBarEventsSubscription(electronWindow, mainInput);

  /**
   * Select item from results list
   */
  const selectItem: SelectItemFn = (item, realEvent) => {
    const event = wrapEvent(realEvent);
    item.onSelect?.(event);
    updateTerm('');
  };

  const getHighlightedResult: () => PluginResult | undefined = () => results[selected];

  const selectCurrent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const current = getHighlightedResult();

    if (current) selectItem(current, event);
  };

  /**
  * Autocomple search term from highlighted result
  */
  const autocomplete = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { term: highlightedTerm } = getHighlightedResult() || {};

    if (highlightedTerm && highlightedTerm !== term) {
      updateTerm(highlightedTerm);
      event.preventDefault();
    }
  };

  /**
 * Handle keyboard shortcuts
 */
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const highlighted = getHighlightedResult();
    if (highlighted?.onKeyDown) highlighted.onKeyDown(event);

    if (event.defaultPrevented) return;

    const keyActions = {
      select: () => selectCurrent(event),

      arrowRight: () => {
        if (cursorInEndOfInput(event.target as HTMLInputElement)) {
          if (!highlighted) return;
          const autocompleteValue = getAutocompleteValue(highlighted, term);
          if (autocompleteValue) {
            // Autocomplete by arrow right only if autocomple value is shown
            autocomplete(event);
          } else {
            electronWindow.webContents.send(CHANNELS.FocusPreview);
            event.preventDefault();
          }
        }
      },

      arrowDown: () => {
        moveCursor(1);
      },

      arrowUp: () => {
        if (results.length > 0) {
          moveCursor(-1);
        } else if (prevTerm) {
          updateTerm(prevTerm);
        }
      }
    };

    // shortcuts for ctrl+...
    if ((event.metaKey || event.ctrlKey) && !event.altKey) {
      // Copy to clipboard on cmd+c
      if (event.code === 'KeyC') {
        const text = highlighted?.clipboard || term;

        if (text) {
          clipboard.writeText(text);
          if (!event.defaultPrevented) {
            electronWindow.hide();
          }
          event.preventDefault();
        }
        return;
      }

      // Select text on cmd+a
      if (event.code === 'KeyA') {
        mainInput.current?.select();
        event.preventDefault();
      }

      // Select element by number
      if (isFinite(+event.key)) {
        const number = Number(event.key);
        const result = results[number];

        if (result) return selectItem(result, event);
      }

      // Select element on control+arrow
      if (event.code === 'ArrowUp' || event.code === 'PageUp') {
        setSelected(0);
        event.preventDefault();
      }
      if (event.code === 'ArrowDown' || event.code === 'PageDown') {
        setSelected(results.length - 1);
        event.preventDefault();
      }
      if (event.code === 'ArrowRight') {
        if (results.length > selected + 9) {
          setSelected(selected + 9);
        } else {
          setSelected(results.length - 1);
        }
        return;
      }
      if (event.code === 'ArrowLeft') {
        if (selected - 9 > 0) {
          setSelected(selected - 9);
        } else {
          setSelected(0);
        }
        return;
      }

      // Lightweight vim-mode: cmd/ctrl + jklo
      switch (event.code) {
        case 'KeyJ':
          keyActions.arrowDown();
          break;
        case 'KeyK':
          keyActions.arrowUp();
          break;
        case 'KeyL':
          keyActions.arrowRight();
          break;
        case 'KeyO':
          keyActions.select();
          break;
      }
    }

    switch (event.key) {
      case 'Tab':
        autocomplete(event);
        break;
      case 'ArrowRight':
        keyActions.arrowRight();
        break;
      case 'ArrowDown':
        keyActions.arrowDown();
        break;
      case 'ArrowUp':
        keyActions.arrowUp();
        break;
      case 'Enter':
        keyActions.select();
        break;
      case 'Escape':
        location === '/' ? electronWindow.hide() : navigate('/');
        break;
    }
  };

  return (
    <input
      spellCheck={false}
      autoFocus
      placeholder='Search in Rokii...'
      ref={mainInput}
      value={term}
      className={styles.input}
      onChange={(e) => updateTerm(e.target.value)}
      onKeyDown={onKeyDown}
    />
  );
};
