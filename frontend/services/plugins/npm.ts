import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import tar from "tar-fs";
import zlib from "node:zlib";
import https from "node:https";
import { move, remove } from "fs-extra";

/**
 * Base url of npm API
 */
const API_BASE = "http://registry.npmjs.org/";

/**
 * Format name of file from package archive.
 * Just remove `./package`prefix from name
 *
 * @param  {Object} header
 * @return {Object}
 */
const formatPackageFile = (header: tar.Headers) => ({
  ...header,
  name: header.name.replace(/^package\//, ""),
});

const installPackage = async (
  tarPath: string,
  destination: string,
  middleware: () => Promise<any>
) => {
  console.log(`Extract ${tarPath} to ${destination}`);

  const packageName = path.parse(destination).name;
  const tempPath = path.join(os.tmpdir(), packageName);

  console.log(`Download and extract to temp path: ${tempPath}`);

  await new Promise((resolve, reject) => {
    https.get(tarPath, (stream) => {
      // @ts-ignore
      const result = stream.pipe(zlib.Unzip()).pipe(
        tar.extract(tempPath, {
          map: formatPackageFile,
        })
      );
      result.on("error", reject);
      result.on("finish", () => {
        middleware().then(resolve);
      });
    });
  });

  console.log(`Move ${tempPath} to ${destination}`);
  // Move temp folder to real location
  await move(tempPath, destination, { overwrite: true });
};

/**
 * Lightweight npm client.
 * It only can install/uninstall package, without resolving dependencies
 *
 * @param  dir Path to npm package directory
 */
export default (dir: string) => {
  console.log(dir);
  const packageJson = path.join(dir, "package.json");
  const setConfig = (config: any) =>
    fs.writeFileSync(packageJson, JSON.stringify(config, null, 2));
  const getConfig = () => JSON.parse(fs.readFileSync(packageJson, "utf-8"));
  return {
    /**
     * Install npm package
     * @param name Name of package in npm registry
     *
     * @param  options
     *             version {String} Version of npm package. Default is latest version
     *             middleware {Function<Promise>}
     *               Function that returns promise. Called when package's archive is extracted
     *               to temp folder, but before moving to real location
     */
    async install(
      name: string,
      options: {
        version?: string;
        middleware?: () => Promise<any>;
      } = {}
    ) {
      let versionToInstall;
      const version = options.version || null;
      const middleware = options.middleware || (() => Promise.resolve());

      console.group("[npm] Install package", name);

      try {
        const resJson = await fetch(`${API_BASE}${name}`).then((response) =>
          response.json()
        );

        versionToInstall = version || resJson["dist-tags"].latest;
        console.log("Version:", versionToInstall);
        await installPackage(
          resJson.versions[versionToInstall].dist.tarball,
          path.join(dir, "node_modules", name),
          middleware
        );

        const json = getConfig();
        json.dependencies[name] = versionToInstall;
        console.log("Add package to dependencies");
        setConfig(json);
        console.log("Finished installing", name);
        console.groupEnd();
      } catch (err) {
        console.log("Error in package installation");
        console.log(err);
        console.groupEnd();
      }
    },

    update(name: string) {
      // Plugin update is downloading `.tar` and unarchiving it to temp folder
      // Only if this part was succeeded, current version of plugin is uninstalled
      // and temp folder moved to real plugin location
      const middleware = () => this.uninstall(name);
      return this.install(name, { middleware });
    },

    /**
     * Uninstall npm package
     */
    async uninstall(name: string) {
      const modulePath = path.join(dir, "node_modules", name);
      console.group("[npm] Uninstall package", name);
      console.log("Remove package directory ", modulePath);
      try {
        await remove(modulePath);

        const json = getConfig();
        console.log("Update package.json");
        delete json.dependencies?.[name];

        console.log("Rewrite package.json");
        setConfig(json);

        console.groupEnd();
        return true;
      } catch (err) {
        console.log("Error in package uninstallation");
        console.log(err);
        console.groupEnd();
        return false;
      }
    },
  };
};
