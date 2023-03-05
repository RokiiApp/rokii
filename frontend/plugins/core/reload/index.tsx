import type { PluginModule } from "@rokii/api";

import { app } from "@electron/remote";
import icon from "../icon.png";

const keyword = "reload";
const title = "Reload";
const subtitle = "Reload RoKii App";

const onSelect = () => {
  app.relaunch();
  app.exit();
};

/**
 * Plugin to reload Rokii
 */
const fn: PluginModule["fn"] = ({ term, display }) => {
  const match = "reload".includes(term.toLowerCase());

  if (match) {
    display({ icon, title, subtitle, onSelect });
  }
};

export { keyword, title as name, fn };
