import type { PluginResult } from '@rokii/types';
import type { ReactElement } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import styles from './styles.module.css';

const ErrorPluginPreview = ({ error }: FallbackProps) => {
  return <div>
        Plugin Failed to run:
        <br />
        {error.message}
    </div>;
};

export type PluginResultWithPreview = PluginResult & { getPreview: () => ReactElement | null };

export const PluginPreview = ({ plugin }: { plugin: PluginResultWithPreview }) => {
  const preview = plugin.getPreview();
  const previewIsString = typeof preview === 'string';
  return (
        <div className={styles.preview} id="preview">
            {previewIsString
              ? (
                <div dangerouslySetInnerHTML={{ __html: preview }} />
                )
              : (
                <ErrorBoundary
                    FallbackComponent={ErrorPluginPreview}
                    onError={(error) => console.error(error)}
                    resetKeys={[plugin.title]}
                    children={preview}
                />
                )}
        </div>
  );
};
