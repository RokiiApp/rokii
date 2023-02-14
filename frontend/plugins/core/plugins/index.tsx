// @ts-ignore
import { search } from "cerebro-tools";
import { shell } from "electron";
import loadPlugins from "./loadPlugins";
import icon from "../icon.png";
import * as format from "./format";
import Preview from "./Preview";
import initializeAsync from "./initializeAsync";
import { useRokiStore } from "@/state/rokiStore";

function partition(array: any[], predicate: Function) {
  return array.reduce(
    (acc, element) => {
      acc[predicate(element) ? 0 : 1].push(element);
      return acc;
    },
    [[], []]
  );
}

const toString = ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => [name, description].join(" ");

const categories = [
  ["Development", (plugin: any) => plugin.isDebugging],
  ["Updates", (plugin: any) => plugin.isUpdateAvailable],
  ["Installed", (plugin: any) => plugin.isInstalled],
  ["Available", (plugin: any) => plugin.name],
] as const;

const updatePlugin = async (update: Function, name: string) => {
  const plugins = await loadPlugins();
  const updatedPlugin = plugins.find((plugin) => plugin.name === name);
  update(name, {
    title: `${format.name(updatedPlugin.name)} (${format.version(
      updatedPlugin
    )})`,
    getPreview: () => (
      <Preview
        plugin={updatedPlugin}
        key={name}
        onComplete={() => updatePlugin(update, name)}
      />
    ),
  });
};

const pluginToResult = (update: Function) => (plugin: any) => {
  if (typeof plugin === "string") {
    return { title: plugin };
  }

  return {
    icon,
    id: plugin.name,
    title: `${format.name(plugin.name)} (${format.version(plugin)})`,
    subtitle: format.description(plugin.description || ""),
    onSelect: () => shell.openExternal(plugin.repo),
    getPreview: () => (
      <Preview
        plugin={plugin}
        key={plugin.name}
        onComplete={() => updatePlugin(update, plugin.name)}
      />
    ),
  };
};

const categorize = (plugins: any[], callback: Function) => {
  const result: any[] = [];
  let remainder = plugins;

  categories.forEach((category) => {
    const [title, filter] = category;
    const [matched, others] = partition(remainder, filter);
    if (matched.length) result.push(title, ...matched);
    remainder = others;
  });

  plugins.splice(0, plugins.length);
  plugins.push(...result);
  callback();
  return plugins;
};

const fn = async ({
  term,
  display,
  hide,
  update,
}: {
  term: string;
  display: Function;
  hide: Function;
  update: Function;
}) => {
  const match = term.match(/^plugins?\s*(.+)?$/i);
  if (match) {
    display({ icon, id: "loading", title: "Looking for plugins..." });
    const plugins = await loadPlugins();

    const matchingPlugins = plugins.filter((plugin) =>
      search([plugin.name], match[1])
    );
    const orderedPlugins = categorize(matchingPlugins, () => hide("loading"));
    orderedPlugins
      .map((plugin) => pluginToResult(update)(plugin))
      .map((plugin) => display(plugin));
  }
};

export default {
  icon,
  fn,
  initializeAsync,
  name: "Manage plugins",
  keyword: "plugins",
  onMessage: (type: any) => {
    if (type === "plugins:start-installation") {
      useRokiStore.setState({ statusBarText: "Installing default plugins..." });
    }
    if (type === "plugins:finish-installation") {
      setTimeout(() => {
        useRokiStore.setState({ statusBarText: undefined });
      }, 2000);
    }
  },
};
