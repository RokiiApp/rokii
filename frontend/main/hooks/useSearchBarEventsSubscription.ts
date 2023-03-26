import { useInputStore } from '@/state/inputStore';
import * as config from 'common/config';
import { CHANNELS } from 'common/constants/events';
import { on } from 'common/ipc';
import { BrowserWindow, ipcRenderer } from 'electron';

import { useEffect } from 'react';

export const useSearchBarEventsSubscription = (electronWindow: BrowserWindow, mainInput: any) => {
  const updateTerm = useInputStore(s => s.updateTerm);

  const onFocusInputRequest = () => {
    mainInput.current?.focus();
  };

  const onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      mainInput.current?.focus();
    }
  };

  const handleShowEvent = () => {
    mainInput.current?.focus();
    if (config.get('selectOnShow')) {
      mainInput.current?.select();
    }
  };

  const cleanup = () => {
    window.removeEventListener('keydown', onDocumentKeydown);
    window.removeEventListener('beforeunload', cleanup);
    electronWindow.removeAllListeners('show');
    ipcRenderer.removeAllListeners(CHANNELS.ClearInput);
    ipcRenderer.removeAllListeners(CHANNELS.ShowTerm);
    ipcRenderer.removeAllListeners(CHANNELS.FocusInput);
  };

  useEffect(() => {
    if (!mainInput) return;

    // Add some global key handlers
    window.addEventListener('keydown', onDocumentKeydown);
    // Cleanup event listeners on unload
    // NOTE: when page refreshed (location.reload) componentWillUnmount is not called
    window.addEventListener('beforeunload', cleanup);
    electronWindow.on('show', handleShowEvent);

    on(CHANNELS.ClearInput, () => updateTerm(''));
    on(CHANNELS.ShowTerm, (_, term) => updateTerm(term));
    on(CHANNELS.FocusInput, onFocusInputRequest);

    // function to be called when unmounted
    return () => {
      cleanup();
    };
  }, [mainInput]);
};
