import { useEffect, useState } from 'react';
import { useRokiStore } from '@/state/rokiStore';
import { commandsWatcher } from '@/services/commands/CommandsWatcher';
import { scriptsWatcher } from '@/services/scripts/ScriptsWatcher';
import { search } from '@rokii/utils';
import { CommandInfo } from '@/services/commands/types';
import { Script } from '@/services/scripts/types';

export const useHomeResults = (term: string) => {
  const [results, setResults] = useState<(CommandInfo | Script)[]>([]);

  const resetResultsState = useRokiStore(s => s.reset);

  useEffect(() => {
    resetResultsState();

    const commands = commandsWatcher.getCommands();
    const scripts = scriptsWatcher.getScripts();

    const matching = search([...commands, ...scripts], term, r => `${r.title} ${r.subtitle}`);

    setResults(matching);

    // Reset results state on unmount so we don't have stale results and autocomplete values
    return () => resetResultsState();
  }, [term]);

  return results;
};
