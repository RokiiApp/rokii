import { RouteComponentProps } from 'wouter';
import { Loading } from '@rokii/ui';
import styles from './styles.module.css';
import { useRunCommand } from '@/main/hooks/useRunCommand';

export const CommandPage = ({ params }: RouteComponentProps<{ keyword: string, args?: string }>) => {
  const [commandResult, loading, command] = useRunCommand(params);

  if (!command) return null;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>{command.name}</h1>
      {loading ? <Loading /> : <pre tabIndex={0} className={styles.execResult}>{commandResult}</pre>}
    </div>
  );
};
