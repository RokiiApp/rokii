import * as core from "./core";
import externalPlugins from "./externalPlugins";

export type pluginSchema = {
  fn?: (args?: any) => void;
  name?: string;
  icon?: string;
  keyword?: string;
  initializeAsync?: (args?: any) => void;
  onMessage?: (args?: any) => void;
  settings: Record<NamedCurve, any>;
};

export const pluginsService = {
  corePlugins: core,
  allPlugins: Object.assign(externalPlugins, core),
  externalPlugins,
} as const;
