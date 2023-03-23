import { ensureDir, existsSync, writeFileSync } from 'fs-extra';
import { NpmClient } from '@/services/NpmClient';
import { PLUGINS_NODE_MODULES_PATH, PLUGINS_PACKAGE_JSON_PATH, PLUGINS_PATH, ROKII_PATH } from '@/constants';

const ensureFile = (src: string, content = '') => {
  if (!existsSync(src)) {
    writeFileSync(src, content);
  }
};

const EMPTY_PACKAGE_JSON = JSON.stringify(
  {
    name: 'rokii-plugins',
    dependencies: {}
  },
  null,
  2
);

export const ensureRokiNeededFiles = async () => {
  await ensureDir(ROKII_PATH);
  await ensureDir(PLUGINS_PATH);
  await ensureDir(PLUGINS_NODE_MODULES_PATH);
  ensureFile(PLUGINS_PACKAGE_JSON_PATH, EMPTY_PACKAGE_JSON);
};

export const client = new NpmClient(PLUGINS_PATH);
export { default as pluginSettings } from './settings';
