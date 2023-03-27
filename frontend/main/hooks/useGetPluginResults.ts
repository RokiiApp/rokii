import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { pluginsService } from '@/extensions';
import { DEFAULT_SCOPE } from '../utils/pluginDefaultScope';
import { useRokiStore } from '@/state/rokiStore';
import { pluginSettings } from '@/services/plugins';
import { useInputStore } from '@/state/inputStore';
import { displayScripts } from '@/services/scripts/displayScripts';
import { displayCommands } from '@/services/commands/displayCommmands';

export const useGetPluginResults = (term: string) => {
  const [, navigate] = useLocation();
  const updateTerm = useInputStore(s => s.updateTerm);

  const addResult = useRokiStore(s => s.addResult);
  const updateResult = useRokiStore(s => s.updateResult);
  const resetResultsState = useRokiStore(s => s.reset);
  const hide = useRokiStore(s => s.hide);

  useEffect(() => {
    resetResultsState();

    const { allPlugins } = pluginsService;
    // TODO: order results by frequency?
    Object.keys(allPlugins).forEach((name) => {
      const plugin = allPlugins[name];
      try {
        plugin.fn?.({
          ...DEFAULT_SCOPE,
          actions: {
            ...DEFAULT_SCOPE.actions,
            replaceTerm: (newTerm: string) => updateTerm(newTerm)
          },
          term,
          hide: (id) => hide(`${name}-${id}`),
          update: (id, result) => updateResult(`${name}-${id}`, result),
          display: (payload) => addResult(name, payload),
          settings: pluginSettings.getUserSettings(plugin, name)
        });
      } catch (error) {
        // Do not fail on plugin errors, just log them to console
        console.log('Error running plugin', name, error);
      }
    });

    displayScripts(term, addResult, navigate);
    displayCommands(term, addResult, navigate);

    // Reset results state on unmount so we don't have stale results and autocomplete values
    return () => resetResultsState();
  }, [term]);
};
