import * as version from "./version";
import * as quit from "./quit";
import * as settings from "./settings";
import * as reload from "./reload";
import * as plugins from "./plugins";
import * as autocomplete from "./autocomplete";

import { PluginModule } from "@/types";

export const corePlugins: Record<string, PluginModule> = {
    autocomplete,
    version,
    quit,
    settings,
    reload,
    plugins,
}
