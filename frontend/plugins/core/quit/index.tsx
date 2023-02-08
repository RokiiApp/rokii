import { app } from "@electron/remote";
// @ts-ignore
import { search } from "cerebro-tools";
import icon from "../icon.png";

const KEYWORDS = ["Quit", "Exit"];

const subtitle = "Quit from Cerebro";
const onSelect = () => app.quit();

/**
 * Plugin to exit from Cerebro
 *
 * @param  {String} options.term
 * @param  {Function} options.display
 */
const fn = ({ term, display }: { term: string; display: Function }) => {
  const result = search(KEYWORDS, term).map((title: string) => ({
    icon,
    title,
    subtitle,
    onSelect,
    term: title,
  }));
  display(result);
};

export default { fn };
