import { useRokiStore } from '@/state/rokiStore';
import styles from './styles.module.css';

function StatusBar () {
  const statusBarText = useRokiStore((s) => s.statusBarText);
  if (!statusBarText) return null;
  return <div className={styles.statusBar}>{statusBarText}</div>;
}

export { StatusBar };
