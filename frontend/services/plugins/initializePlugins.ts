import type { PluginModule } from '@rokii/types';

import { on, send } from '@/services/rpc';
import { pluginsService } from '@/extensions';
import { pluginSettings } from '@/services/plugins';
import { RPCEvents } from '@/constants';

export const initPlugin = (plugin: PluginModule, name: string) => {
  const { initialize, initializeAsync } = plugin;

  // Foreground plugin initialization
  if (initialize) {
    console.log('Initialize sync plugin', name);

    try {
      initialize(pluginSettings.getUserSettings(plugin, name));
    } catch (e) {
      console.error(`Failed to initialize plugin: ${name}`, e);
    }
  }

  // Background plugin initialization
  if (initializeAsync) {
    console.log('Initialize async plugin', name);
    send(RPCEvents.InitializePluginAsync, { name });
  }
};

/**
 * Initialize all plugins and start listening for replies from plugin async initializers
 */
export const initializePlugins = () => {
  const { allPlugins } = pluginsService;
  Object.keys(allPlugins).forEach((name) => initPlugin(allPlugins[name], name));

  // Start listening for replies from plugin async initializers
  on(RPCEvents.PluginMessage, ({ name, data }) => {
    const plugin = allPlugins[name];
    plugin?.onMessage?.(data);
  });
};
