import type { PluginModule } from "@rokii/api";

import icon from "../icon.png";
import { app } from "@electron/remote";

// @ts-ignore
import { search } from "cerebro-tools";

const NAME = "RoKii Version";
const order = 9;
const KEYWORDS = [NAME, "ver", "version"];

/**
 * Plugin to show app settings in results list
 */
const plugin: PluginModule["fn"] = ({ term, display }) => {
  const result = search(KEYWORDS, term).map((title: string) => ({
    order,
    icon,
    title,
    getPreview: () => (
      <div>
        <strong>{app.getVersion()}</strong>
      </div>
    ),
    term: title,
  }));

  display(result);
};

export { NAME as name, plugin as fn };
