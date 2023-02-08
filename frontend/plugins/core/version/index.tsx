import icon from "../icon.png";
import { app } from "@electron/remote";
// @ts-ignore
import { search } from "cerebro-tools";
// Settings plugin name
const NAME = "Cerebro Version";

// Settings plugins in the end of list
const order = 9;

// Phrases that used to find settings plugins
const KEYWORDS = [NAME, "ver", "version"];

/**
 * Plugin to show app settings in results list
 *
 */
const plugin = ({ term, display }: { term: string; display: Function }) => {
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

export default { name: NAME, fn: plugin };
