import path from "node:path";
import { ensureDir, existsSync, writeFileSync } from "fs-extra";
import npm from "./npm";
import { app } from "@electron/remote";

const ensureFile = (src: string, content = "") => {
  if (!existsSync(src)) {
    writeFileSync(src, content);
  }
};

const EMPTY_PACKAGE_JSON = JSON.stringify(
  {
    name: "rokii-plugins",
    dependencies: {},
  },
  null,
  2
);

export const rokiPath = path.join(app.getPath("appData"), "rokii");
export const pluginsPath = path.join(rokiPath, "plugins");
export const MODULES_DIRECTORY = path.join(pluginsPath, "node_modules");
export const PACKAGE_JSON_PATH = path.join(pluginsPath, "package.json");

export const ensureRokiNeededFiles = async () => {
  await ensureDir(rokiPath);
  await ensureDir(pluginsPath);
  await ensureDir(MODULES_DIRECTORY);
  ensureFile(PACKAGE_JSON_PATH, EMPTY_PACKAGE_JSON);
};

export const client = npm(pluginsPath);
export { default as pluginSettings } from "./settings";
