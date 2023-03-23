import { commandsWatcher } from '@/services/commands/CommandsWatcher';
import { shellCommand } from '@rokii/utils';
import { useEffect, useState } from 'react';
import { useHashLocation } from './useHashLocation';

export const useRunCommand = (params: { keyword: string, args?: string }) => {
  const [commandResult, setCommandResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [, useLocation] = useHashLocation();

  const command = commandsWatcher.getCommands().find((command) => command.keyword === params.keyword);
  const args = params.args && decodeURI(params.args);
  const commandToExecute = command?.command ? command.command + args : args;

  useEffect(() => {
    if (!command || !commandToExecute) {
      return useLocation('/');
    }

    shellCommand(commandToExecute).then((result) => {
      setCommandResult(result as string);
      setLoading(false);
    }).catch((error) => {
      setLoading(false);
      setCommandResult(error.message);
    });
  }, []);

  return [commandResult, loading, command] as const;
};
