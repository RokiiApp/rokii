import type { PluginModule, PluginResult } from "@/types";

// @ts-ignore
import { search } from "cerebro-tools";

import { pluginsService } from "@/plugins";
import icon from "../icon.png";

/**
 * If the term is an exact match of the plugin keyword, we don't want to show it
 * in the results, because it will be shown by the plugin itself
 */
const notMatchExactMatch = (term: string, plugin: PluginModule) =>
  plugin.keyword !== term && `${plugin.keyword} ` !== term;

type PluginToResult = (res: PluginModule, actions: any) => PluginResult;
const pluginToResult: PluginToResult = ({ name, keyword, icon }, actions) => {
  return {
    title: name || keyword!,
    icon: icon || icon,
    term: `${keyword} `,
    onSelect: (event) => {
      event.preventDefault();
      actions.replaceTerm(`${keyword} `);
    },
  };
};

/**
 * Plugin for autocomplete other plugins
 */
const fn: PluginModule["fn"] = ({ term, display, actions }) => {
  const { allPlugins } = pluginsService;

  const pluginsWithKeywords = Object.values(allPlugins).filter(
    (plugin) => !!plugin.keyword
  );

  if (pluginsWithKeywords.length === 0) return;

  let searchResults = (
    search(
      pluginsWithKeywords,
      term,
      (p: PluginModule) => p.keyword
    ) as PluginModule[]
  ).filter((result) => notMatchExactMatch(term, result));

  const results = searchResults.map((p) => pluginToResult(p, actions));

  display(results);
};

const name = "Plugins autocomplete";

export { fn, name, icon };
