import type { PluginResult } from '@rokii/types';
import { focusableSelector } from '@rokii/ui';
import { CHANNELS } from 'common/constants/events';
import { on } from 'common/ipc';
import { ipcRenderer } from 'electron';
import { ReactElement, useEffect, useRef } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import styles from './styles.module.css';

type FocusableElements = HTMLAnchorElement | HTMLAreaElement | HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
/**
 * Set focus to first focusable element in preview
 */
const focusPreview = (ref: React.RefObject<HTMLElement>) => {
  const firstFocusable = ref.current?.querySelector<FocusableElements>(focusableSelector);
  if (firstFocusable) {
    firstFocusable.focus();
  }
};

const ErrorPluginPreview = ({ error }: FallbackProps) => {
  return (
    <div>
      Plugin Failed to run:
      <br />
      {error.message}
    </div>
  );
};

export type PluginResultWithPreview = PluginResult & { getPreview: () => ReactElement | null };

export const PluginPreview = ({ plugin }: { plugin: PluginResultWithPreview }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleFocusPreview = () => {
    focusPreview(ref);
  };

  useEffect(() => {
    on(CHANNELS.FocusPreview, handleFocusPreview);

    return () => {
      ipcRenderer.removeAllListeners(CHANNELS.FocusPreview);
    };
  }, []);

  const Preview = plugin.getPreview();

  const previewIsString = typeof Preview === 'string';
  return (
    <div className={styles.preview} id='preview' ref={ref}>
      {previewIsString
        ? (
          <div dangerouslySetInnerHTML={{ __html: Preview }} />
          )
        : (
          <ErrorBoundary
            FallbackComponent={ErrorPluginPreview}
            onError={(error) => console.error(error)}
            resetKeys={[plugin.title]}

          >
            {Preview}
          </ErrorBoundary>
          )}
    </div>
  );
};
