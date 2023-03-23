import { RouteComponentProps } from 'wouter';
import { commandsWatcher } from '@/services/commands/CommandsWatcher';
import { useHashLocation } from '@/main/hooks/useHashLocation';
import { useEffect, useState } from 'react';
import { shellCommand } from '@rokii/utils';
import styles from './styles.module.css';

export const CommandPage = ({ params }: RouteComponentProps<{ keyword: string}>) => {
  const [commandResult, setCommandResult] = useState<string>('');
  const [, useLocation] = useHashLocation();
  const command = commandsWatcher.getCommands().find((command) => command.keyword === params.keyword);

  useEffect(() => {
    if (!command) {
      return useLocation('/');
    }

    shellCommand(command.command).then((result) => {
      setCommandResult(result as string);
    });
  }, []);

  if (!command) return null;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>{command.name}</h1>
      <pre tabIndex={0} className={styles.execResult}>{commandResult}
      </pre>
    </div>
  );
};
