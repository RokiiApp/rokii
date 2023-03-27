import { Suspense, lazy } from 'react';
import { RouteComponentProps } from 'wouter';
import { Loading } from '@rokii/ui';
import styles from './styles.module.css';
import { ErrorBoundary } from 'react-error-boundary';

const loadComponent = (modulePath: string) => lazy(() => import(/* @vite-ignore */ modulePath));

export const CommandPage = ({ params }: RouteComponentProps<{ modulePath: string }>) => {
  return (
    <div className={styles.wrapper}>
      <h1>Command Page</h1>
      <Suspense fallback={<Loading />}>
        {(() => {
          const MaybeComponent = loadComponent(decodeURI(params.modulePath));
          return <ErrorBoundary fallback={<div>Something went wrong loading module</div>}><MaybeComponent /></ErrorBoundary>;
        })()}
      </Suspense>
    </div>
  );
};
