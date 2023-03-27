import { RouteComponentProps } from 'wouter';
import { Loading } from '@rokii/ui';
import styles from './styles.module.css';
import { useRunScript } from '@/main/hooks/useRunScript';

export const ScriptPage = ({ params }: RouteComponentProps<{ keyword: string, args?: string }>) => {
  const [scriptResult, loading, script] = useRunScript(params);

  if (!script) return null;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>{script.title}</h1>
      {loading ? <Loading /> : <pre tabIndex={0} className={styles.execResult}>{scriptResult}</pre>}
    </div>
  );
};
