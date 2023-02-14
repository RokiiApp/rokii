import { PACKAGE_JSON_PATH } from "@/services/plugins";
import { readFile } from "fs/promises";
import { pluginsService } from "@/plugins";

const readPackageJson = async () => {
  try {
    const fileContent = await readFile(PACKAGE_JSON_PATH, { encoding: "utf8" });
    return JSON.parse(fileContent);
  } catch (err) {
    console.log(err);
    return {};
  }
};

/**
 * Get list of all installed plugins with versions
 *
 */
export default async () => {
  const { externalPlugins } = pluginsService;
  const packageJson = await readPackageJson();
  const result: Record<string, any> = {};

  Object.keys(externalPlugins).forEach((pluginName) => {
    result[pluginName] = {
      ...externalPlugins[pluginName],
      version: packageJson.dependencies[pluginName] || "0.0.0",
    };
  });

  return result;
};
