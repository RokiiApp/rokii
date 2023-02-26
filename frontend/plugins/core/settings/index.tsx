import type { PluginModule } from "@/types";

// @ts-ignore
import { search } from "cerebro-tools";
import Settings from "./Settings";
import icon from "../icon.png";

const NAME = "RoKI Settings";
const order = 9;
const KEYWORDS = [NAME, "RoKI Preferences", "cfg", "config", "params"];

/**
 * Plugin to show app settings in results list
 */
const plugin: PluginModule["fn"] = ({ term, display, config }) => {
  const found = search(KEYWORDS, term).length > 0;
  if (found) {
    const getPreview = () => (
      <Settings
        set={(key, value) => config.set(key, value)}
        get={(key) => config.get(key)}
      />
    );

    display({ order, icon, title: NAME, term: NAME, getPreview });
  }
};

export { NAME as name, plugin as fn };
