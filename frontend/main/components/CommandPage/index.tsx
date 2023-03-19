import { RouteComponentProps } from 'wouter';
import { Command } from '@/services/commands/types';
import { getCommands } from '@/services/commands/getCommands';
import { useHashLocation } from '@/main/hooks/useHashLocation';
import { useEffect, useState } from 'react';
import { shellCommand } from '@rokii/utils';
import styles from './styles.module.css';

export const CommandPage = ({ params }: RouteComponentProps<{ keyword: string}>) => {
  const [commandResult, setCommandResult] = useState<string>('');
  const [, useLocation] = useHashLocation();
  const command = getCommands().find((command: Command) => command.keyword === params.keyword);

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
