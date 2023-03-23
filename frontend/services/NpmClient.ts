import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { createUnzip } from 'node:zlib';
import https from 'node:https';
import { extract, Headers } from 'tar-fs';
import { move, remove } from 'fs-extra';
import { NPM_API_BASE } from '@/constants';

/**
 * Format name of file from package archive.
 * Just remove `./package`prefix from name
 */
const formatPackageFile = (header: Headers) => ({
  ...header,
  name: header.name.replace(/^package\//, '')
});

/**
 * Lightweight npm client used to install/uninstall package, without resolving dependencies
 */
export class NpmClient {
  private packageJsonPath: string;
  private dirPath: string;

  /**
   * @param dir Path to npm package directory
   */
  constructor (dir: string) {
    this.dirPath = dir;
    this.packageJsonPath = path.join(dir, 'package.json');
  }

  private updatePackageJson (config: Record<string, any>): void {
    fs.writeFileSync(this.packageJsonPath, JSON.stringify(config, null, 2));
  }

  private getPackageJson (): Record<string, any> {
    return JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf-8'));
  }

  /**
     * Install npm package
     */
  async installPackage (
    /**
     * Name of npm package in the registry
     */
    name: string,
    options?: {
    /**
     * Version of npm package. Default is latest version
     */
    version?: string;
    /**
     * Function that returns promise. Called when package's archive is extracted
     * to temp folder, but before moving to real location
     */
    middleware?: () => Promise<any>;
  }
  ) {
    let versionToInstall;
    const { version, middleware } = options || {};

    console.group('[NpmClient] Install package', name);

    try {
      const resJson = await fetch(`${NPM_API_BASE}${name}`).then((res) => res.json());

      versionToInstall = version || resJson['dist-tags'].latest;
      console.log('Version:', versionToInstall);

      await this.downloadAndExtractPackage(
        resJson.versions[versionToInstall].dist.tarball,
        path.join(this.dirPath, 'node_modules', name),
        middleware
      );

      const json = this.getPackageJson();
      json.dependencies[name] = versionToInstall;
      console.log('Add package to dependencies');
      this.updatePackageJson(json);
      console.log('Finished installing', name);
      console.groupEnd();
    } catch (err) {
      console.log('Error in package installation');
      console.log(err);
      console.groupEnd();
    }
  }

  updatePackage (name: string) {
    // Plugin update is downloading `.tar` and unarchiving it to temp folder
    // Only if this part was succeeded, current version of plugin is uninstalled
    // and temp folder moved to real plugin location
    const middleware = () => this.uninstallPackage(name);
    return this.installPackage(name, { middleware });
  }

  /**
     * Uninstall npm package
     */
  async uninstallPackage (name: string) {
    const modulePath = path.join(this.dirPath, 'node_modules', name);
    console.group('[NpmClient] Uninstall package', name);
    console.log('Remove package directory ', modulePath);
    try {
      await remove(modulePath);

      const json = this.getPackageJson();
      console.log('Update package.json');
      delete json.dependencies?.[name];

      console.log('Rewrite package.json');
      this.updatePackageJson(json);

      console.groupEnd();
      return true;
    } catch (err) {
      console.log('Error in package uninstallation');
      console.log(err);
      console.groupEnd();
      return false;
    }
  }

  private async downloadAndExtractPackage (
    tarURL: string,
    destination: string,
    middleware?: () => Promise<any>
  ) {
    console.log(`Extract ${tarURL} to ${destination}`);

    const packageName = path.parse(destination).name;
    const tempPath = path.join(os.tmpdir(), packageName);

    console.log(`Download and extract to temp path: ${tempPath}`);

    await new Promise((resolve, reject) => {
      https.get(tarURL, (stream) => {
        const result = stream.pipe(createUnzip()).pipe(
          extract(tempPath, { map: formatPackageFile })
        );
        result.on('error', reject);
        result.on('finish', async () => {
          await middleware?.();
          resolve(true);
        });
      });
    });

    console.log(`Move ${tempPath} to ${destination}`);
    // Move temp folder to real location
    await move(tempPath, destination, { overwrite: true });
  }
}
