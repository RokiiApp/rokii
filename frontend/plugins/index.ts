import * as core from "./core";
import externalPlugins from "./externalPlugins";

export const pluginsService = {
  corePlugins: core,
  allPlugins: Object.assign(externalPlugins, core),
  externalPlugins,
} as const;
