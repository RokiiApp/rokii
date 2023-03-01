import { pluginsService } from "@/plugins";
import { on, send } from "@/services/rpc";
import { pluginSettings, MODULES_DIRECTORY } from "@/services/plugins";
import { RPCEvents } from "@/constants";

on(RPCEvents.InitializePluginAsync, ({ name }: { name: any }) => {
  const { corePlugins } = pluginsService;
  console.group(`Initialize async plugin ${name}`);

  try {
    const plugin = // @ts-ignore
      corePlugins[name] || window.require(`${MODULES_DIRECTORY}/${name}`);
    const { initializeAsync } = plugin;

    if (!initializeAsync) {
      console.log("no `initializeAsync` function, skipped");
      return;
    }

    console.log("running `initializeAsync`");

    // TODO: BREAKING CHANGE: move to promise-based API
    initializeAsync((data: any) => {
      console.log("Done! Sending data back to main window");
      // Send message back to main window with initialization result
      send(RPCEvents.PluginMessage, { name, data });
    }, pluginSettings.getUserSettings(plugin, name));

  } catch (err) {
    console.log("Failed", err);
  }
  console.groupEnd();
});
