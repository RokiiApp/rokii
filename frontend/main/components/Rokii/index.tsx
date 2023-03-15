import { Router, Route } from 'wouter';
import { useHashLocation } from '@/main/hooks/useHashLocation';

import ResultsList from '../ResultsList';
import { StatusBar } from '../StatusBar';
import styles from './styles.module.css';

import { PluginPage } from '@/main/components/PluginPage';
import { InputBox } from '@/main/components/InputBox';

/**
 * Main search container
 */
export const Rokii = () => {
  return (
    <div className={styles.rokiContainer}>
      <InputBox />

      <div className={styles.resultsContainer}>
        <Router hook={useHashLocation}>
          <Route path='/'>
            <ResultsList />
          </Route>
          <Route path='/:plugin' component={PluginPage} />
        </Router>
      </div>

      <StatusBar />
    </div>
  );
};
