import { PLUGINS_NODE_MODULES_PATH } from '@/constants';
import { readdir, lstat } from 'fs/promises';
import { join } from 'path';

export const isSymlink = async (file: string) => {
  const fileInfo = await lstat(join(PLUGINS_NODE_MODULES_PATH, file));
  return fileInfo.isSymbolicLink();
};

export const isScopeDir = async (file: string) => {
  const fileNameMatchesScope = file.match(/^@/);
  if (!fileNameMatchesScope) return false;

  const fileInfo = await lstat(join(PLUGINS_NODE_MODULES_PATH, file));
  return fileInfo.isDirectory();
};

export const getSymlinkedPluginsInFolder = async (scope?: string) => {
  const files = scope
    ? await readdir(join(PLUGINS_NODE_MODULES_PATH, scope))
    : await readdir(PLUGINS_NODE_MODULES_PATH);

  // filter bur with async
  const resultPromises = files.map((name) =>
    isSymlink(scope ? join(scope, name) : name)
  );

  const results = await Promise.all(resultPromises);

  return files.filter((_, index) => results[index]);
};
