import { Router, Route } from 'wouter';
import { useHashLocation } from '@/main/hooks/useHashLocation';

import ResultsList from '@/main/components/ResultsList';
import { StatusBar } from '@/main/components/StatusBar';
import { PluginPage } from '@/main/components/PluginPage';
import { InputBox } from '@/main/components/InputBox';
import { CommandPage } from '@/main/components/CommandPage';
import styles from './styles.module.css';

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
          <Route path='/command/:keyword/:args?' component={CommandPage} />
          <Route path='/:plugin/' component={PluginPage} />
        </Router>
      </div>

      <StatusBar />
    </div>
  );
};
