import { corePlugins } from "./core";
import externalPlugins from "./externalPlugins";

export const pluginsService= {
  corePlugins,
  allPlugins: Object.assign(externalPlugins, corePlugins),
  externalPlugins,
} as const;
