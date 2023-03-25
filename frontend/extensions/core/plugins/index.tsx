import type { PluginContext, PluginModule } from '@rokii/types';
import type { PluginInfo } from './types';
import { search } from '@rokii/utils';
import { shell } from 'electron';
import { getPlugins } from './utils/loadPlugins';
import * as format from './utils/format';
import icon from '../icon.png';
import { Preview } from './Preview';
import { getCurrentWindow } from '@electron/remote';
import { CHANNELS } from 'common/constants/events';

function divideByFilter<T> (array: T[], filter: (element: T) => boolean) {
  return array.reduce(
    (acc, element) => {
      const satisfiesFilter = filter(element);
      const index = Number(!satisfiesFilter);
      acc[index].push(element);
      return acc;
    },
    [[] as T[], [] as T[]] as const
  );
}

type Category = readonly [string, (plugin: PluginInfo) => boolean];

const categories: readonly Category[] = [
  ['Development', (plugin) => Boolean(plugin.isDebugging)],
  ['Updates', (plugin) => Boolean(plugin.isUpdateAvailable)],
  ['Installed', (plugin) => Boolean(plugin.isInstalled)],
  ['Available', (plugin) => Boolean(plugin.name)]
] as const;

const updatePlugin = async (update: PluginContext['update'], name: string) => {
  const plugins = await getPlugins();

  // TODO: This is a hack to get the updated plugin- need to find a better way
  const updatedPlugin = plugins.find((plugin) => plugin.name === name)!;

  const title = `${format.name(updatedPlugin.name)}`;

  getCurrentWindow().webContents.send(CHANNELS.FocusInput);

  update(name, {
    title,
    subtitle: format.version(updatedPlugin),
    getPreview: () => (
      <Preview
        plugin={updatedPlugin}
        key={name}
        onComplete={() => updatePlugin(update, name)}
      />
    )
  });
};

const pluginToResult = (plugin: PluginInfo | string, update: PluginContext['update']) => {
  if (typeof plugin === 'string') return { title: plugin };

  const title = `${format.name(plugin.name)}`;
  const subtitle = format.version(plugin);
  const repoLink = plugin.repo;

  const onSelect = repoLink ? () => shell.openExternal(repoLink) : undefined;

  return {
    icon,
    id: plugin.name,
    title,
    subtitle,
    onSelect,
    getPreview: () => (
      <Preview
        plugin={plugin}
        key={plugin.name}
        onComplete={() => updatePlugin(update, plugin.name)}
      />
    )
  };
};

const categorizePlugins = (plugins: PluginInfo[]) => {
  const result: (PluginInfo | string)[] = [];
  let remainder = plugins;

  categories.forEach((category) => {
    const [title, filter] = category;
    const [matched, others] = divideByFilter(remainder, filter);

    if (matched.length) result.push(title, ...matched);

    remainder = others;
  });

  return result;
};

const fn: PluginModule['fn'] = async ({ term, display, hide, update }) => {
  const match = term.match(/^plugins?\s*(.+)?$/i);
  if (!match) return;

  display({ icon, id: 'plugins-loading', title: 'Looking for plugins...' });

  const plugins = await getPlugins();
  const matchingPlugins = plugins.filter(
    ({ name }) => search([name], match[1]).length > 0
  );

  const categorizeResult = categorizePlugins(matchingPlugins);

  const orderedPlugins = categorizeResult.map((plugin) =>
    pluginToResult(plugin, update)
  );
  hide('plugins-loading');

  display(orderedPlugins);
};

const name = 'Manage plugins';
const keyword = ['plugins'];

export { fn, name, keyword, icon };
export { initializeAsync } from './initializeAsync';
