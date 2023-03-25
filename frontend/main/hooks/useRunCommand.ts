import { scriptsWatcher } from '@/services/scripts/ScriptsWatcher';
import { shellCommand } from '@rokii/utils';
import { useEffect, useState } from 'react';
import { useHashLocation } from './useHashLocation';

export const useRunCommand = (params: { keyword: string, args?: string }) => {
  const [commandResult, setCommandResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [, useLocation] = useHashLocation();

  const script = scriptsWatcher.getCommands().find((command) => command.keyword === params.keyword);
  const args = params.args && decodeURI(params.args);
  const commandToExecute = script?.content ? script.content + args : args;

  useEffect(() => {
    if (!script || !commandToExecute) {
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

  return [commandResult, loading, script] as const;
};
