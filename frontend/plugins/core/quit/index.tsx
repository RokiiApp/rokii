import type { PluginModule } from "@/types";

import { app } from "@electron/remote";
// @ts-ignore
import { search } from "cerebro-tools";
import icon from "../icon.png";

const KEYWORDS = ["Quit", "Exit"];

const subtitle = "Quit from RoKI";
const onSelect = () => app.quit();

export const fn: PluginModule["fn"] = ({ term, display }) => {
  const result = search(KEYWORDS, term).map((title: string) => ({
    icon,
    title,
    subtitle,
    onSelect,
    term: title,
  }));
  display(result);
};
