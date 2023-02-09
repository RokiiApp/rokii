// @ts-ignore
import { search } from "cerebro-tools";
import Settings from "./Settings";
import icon from "../icon.png";

// Settings plugin name
const NAME = "Cerebro Settings";

// Settings plugins in the end of list
const order = 9;

// Phrases that used to find settings plugins
const KEYWORDS = [NAME, "Cerebro Preferences", "cfg", "config", "params"];

/**
 * Plugin to show app settings in results list
 *
 */
const plugin = ({
  term,
  display,
  config,
}: {
  term: string;
  display: Function;
  config: typeof import("common/config");
}) => {
  const found = search(KEYWORDS, term).length > 0;
  if (found) {
    const results = [
      {
        order,
        icon,
        title: NAME,
        term: NAME,
        getPreview: () => (
          <Settings
            set={(key, value) => config.set(key, value)}
            get={(key) => config.get(key)}
          />
        ),
      },
    ];
    display(results);
  }
};

export default {
  name: NAME,
  fn: plugin,
};
