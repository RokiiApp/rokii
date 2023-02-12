import { app } from "@electron/remote";
import icon from "../icon.png";

const keyword = "reload";
const title = "Reload";
const subtitle = "Reload Cerebro App";
const onSelect = () => {
  app.relaunch();
  app.exit();
};

/**
 * Plugin to reload Cerebro
 *
 */
const fn = ({ term, display }: { term: string; display: Function }) => {
  const match = "reload".includes(term.toLowerCase());

  if (match) {
    display({ icon, title, subtitle, onSelect });
  }
};

export default {
  keyword,
  fn,
  icon,
  name: "Reload",
};
