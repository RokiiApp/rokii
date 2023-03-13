import { PACKAGE_JSON_PATH } from '@/services/plugins';
import { readFile } from 'fs/promises';
import { pluginsService } from '@/plugins';

const readPackageJson = async () => {
  try {
    const fileContent = await readFile(PACKAGE_JSON_PATH, { encoding: 'utf8' });
    return JSON.parse(fileContent);
  } catch (err) {
    console.log(err);
    return {};
  }
};

/**
 * Get list of all installed plugins with versions
 */
export const getInstalledPlugins = async () => {
  const { externalPlugins } = pluginsService;
  const packageJson = await readPackageJson();

  const result = Object.keys(externalPlugins).map((pluginName) => {
    return {
      ...externalPlugins[pluginName],
      name: pluginName,
      version: packageJson.dependencies[pluginName] as string || '0.0.0'
    };
  });

  return result;
};
