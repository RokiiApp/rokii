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
    name: "roki-plugins",
    dependencies: {},
  },
  null,
  2
);

export const rokiPath = path.join(app.getPath("appData"), "roki");
export const pluginsPath = path.join(rokiPath, "plugins");
export const modulesDirectory = path.join(pluginsPath, "node_modules");
export const packageJsonPath = path.join(pluginsPath, "package.json");

export const ensureRokiNeededFiles = async () => {
  await ensureDir(rokiPath);
  await ensureDir(pluginsPath);
  await ensureDir(modulesDirectory);
  ensureFile(packageJsonPath, EMPTY_PACKAGE_JSON);
};

export const client = npm(pluginsPath);
export { default as pluginSettings } from "./settings";
