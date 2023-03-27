import { scriptsWatcher } from '@/services/scripts/ScriptsWatcher';
import { shellCommand } from '@rokii/utils';
import { useEffect, useState } from 'react';
import { useHashLocation } from './useHashLocation';

export const useRunScript = (params: { keyword: string, args?: string }) => {
  const [scriptResult, setScriptResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [, useLocation] = useHashLocation();

  const script = scriptsWatcher.getScripts().find(({ keyword }) => keyword === params.keyword);
  const args = params.args && decodeURI(params.args);
  const scriptToExecute = script?.content ? script.content + args : args;

  useEffect(() => {
    if (!script || !scriptToExecute) {
      return useLocation('/');
    }

    shellCommand(scriptToExecute).then((result) => {
      setScriptResult(result as string);
      setLoading(false);
    }).catch((error) => {
      setLoading(false);
      setScriptResult(error.message);
    });
  }, []);

  return [scriptResult, loading, script] as const;
};
