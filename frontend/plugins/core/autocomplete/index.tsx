import type { PluginResult, PluginModule, PluginContext } from '@rokii/types';
import { search } from '@rokii/utils';

import { pluginsService } from '@/plugins';
import icon from '../icon.png';

/**
 * If the term is an exact match of the plugin keyword, we don't want to show it
 * in the results, because it will be shown by the plugin itself
 */
const notMatchExactMatch = (term: string, plugin: PluginModule) =>
  plugin.keyword !== term && `${plugin.keyword} ` !== term;

type PluginToResult = (res: PluginModule, actions: PluginContext['actions']) => PluginResult;
const pluginToResult: PluginToResult = ({ name, keyword, icon }, actions) => {
  const mainKeyword = Array.isArray(keyword) ? keyword[0] : keyword;
  return {
    title: name || mainKeyword!,
    icon: icon || icon,
    term: `${mainKeyword} `,
    onSelect: (event) => {
      event.preventDefault();
      actions.replaceTerm(`${mainKeyword} `);
    }
  };
};

const hasKeyword = (plugin: PluginModule) => Array.isArray(plugin.keyword) ? plugin.keyword.length > 0 : !!plugin.keyword;

let isFirstStart = true;

/**
 * Plugin for autocomplete other plugins
 */
const fn: PluginModule['fn'] = async ({ term, display, actions }) => {
  if (isFirstStart) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    isFirstStart = false;
  }
  const { allPlugins } = pluginsService;

  const pluginsWithKeywords = Object.values(allPlugins).filter(hasKeyword);

  if (pluginsWithKeywords.length === 0) return;

  const searchResults = (
    search(
      pluginsWithKeywords,
      term,
      (p: PluginModule) => Array.isArray(p.keyword) ? p.keyword[0] : p.keyword!
    ) as PluginModule[]
  ).filter((result) => notMatchExactMatch(term, result));

  const results = searchResults.map((p) => pluginToResult(p, actions));

  display(results);
};

const name = 'Plugins autocomplete';

export { fn, name, icon };
