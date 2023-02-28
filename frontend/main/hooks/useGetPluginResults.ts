import { useEffect } from "react";
import { pluginsService } from "@/plugins";
import { DEFAULT_SCOPE } from "../utils/pluginDefaultScope";
import { useRokiStore } from "@/state/rokiStore";
import { pluginSettings } from "@/services/plugins";

export const useGetPluginResults = (term: string) => {
    const updateTerm = useRokiStore(s => s.updateTerm)
    const addResult = useRokiStore(s => s.addResult)
    const updateResult = useRokiStore(s => s.updateResult)
    const hide = useRokiStore(s => s.hide)

    useEffect(() => {
        if (term === "") return;
    
        const { allPlugins } = pluginsService;
        // TODO: order results by frequency?
        Object.keys(allPlugins).forEach((name) => {
          const plugin = allPlugins[name];
          try {
            plugin.fn?.({
              ...DEFAULT_SCOPE,
              actions: {
                ...DEFAULT_SCOPE.actions,
                replaceTerm: (newTerm: string) => updateTerm(newTerm),
              },
              term,
              hide: (id) => hide(`${name}-${id}`),
              update: (id, result) => updateResult(`${name}-${id}`, result),
              display: (payload) => addResult(name, payload),
              settings: pluginSettings.getUserSettings(plugin, name),
            });
          } catch (error) {
            // Do not fail on plugin errors, just log them to console
            console.log("Error running plugin", name, error);
          }
        });
      }, [term]);
}
