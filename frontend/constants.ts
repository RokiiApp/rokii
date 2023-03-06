/**
 * Base url of npm API
 */
export const NPM_API_BASE = "https://registry.npmjs.org/";

export const INITIAL_STATE = {
  results: [],
  selected: 0,
  statusBarText: "",
};

export enum RPCEvents {
  PluginMessage = "plugin-message",
  InitializePluginAsync = "initialize-plugin-async",
}

