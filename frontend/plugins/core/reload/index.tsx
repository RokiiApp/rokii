import type { PluginModule } from "@rokii/types";

import { app } from "@electron/remote";
import icon from "../icon.png";
import { search } from "@rokii/utils";

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
  const match = search([title], term).length > 0
  if (!match) return;

  display({ icon, title, subtitle, onSelect, term: title });
};

export { title as name, fn, icon };
