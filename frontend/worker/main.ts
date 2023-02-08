import { pluginsService } from "@/plugins";
import { on, send } from "@/services/rpc";
import { pluginSettings, modulesDirectory } from "@/services/plugins";

on("initializePluginAsync", ({ name }: { name: any }) => {
  const { corePlugins } = pluginsService;
  console.group(`Initialize async plugin ${name}`);

  try {
    const plugin = // @ts-ignore
      corePlugins[name] || window.require(`${modulesDirectory}/${name}`);
    const { initializeAsync } = plugin;

    if (!initializeAsync) {
      console.log("no `initializeAsync` function, skipped");
      return;
    }

    console.log("running `initializeAsync`");
    initializeAsync((data: any) => {
      console.log("Done! Sending data back to main window");
      // Send message back to main window with initialization result
      send("plugin.message", { name, data });
    }, pluginSettings.getUserSettings(plugin, name));
  } catch (err) {
    console.log("Failed", err);
  }

  console.groupEnd();
});
